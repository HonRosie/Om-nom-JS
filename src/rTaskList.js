var node = document.getElementById("taskList");

appData = {
  projRootId: "root",
  viewDone: false,
  taskId: 0,
  projectList: [],
  focusTaskId: 0,
  taskList: {"root": {id: "root", subtasks: [0]},
                0: {id: 0,
                    desc: "",
                    parentId: "root",
                    doneness: false,
                    subtasks: [],
                    isProjHeader: false,
                    duedate: "",
                    isSelected: false}}
};

//---------------------------------------------------------
// Dispatch
// Handles all the events in the application. Every event
// passes through the dispatcher which then calls the
// appropriate functions
//---------------------------------------------------------

function eventDispatch(action, task, args){
  var shouldDraw = true;
  switch(action){
    case "toggleDone":
      toggleDone(task);
      break;
    case "save":
      save(task, args);
      break;
    case "addTask":
      addTask(task);
      break;
    case "unsubTask":
      unsubTask(task);
      break;
    case "subTask":
      subTask(task);
      break;
    case "delete":
      deleteTask(task);
      break;
    case "isProjToggle":
      isProjToggle(task);
      break;
    case "setDate":
      setDate(task, args);
      break;
    case "toggleSelected":
      toggleSelected(task);
      break;
    case "gotoProject":
      gotoProject(task);
      break;
    case "massAssignDate":
      massAssignDate(args)
      break;
  }

  localStorage["appData"] = JSON.stringify(appData);
  if(shouldDraw) {
    draw();
  }
}

function save(task, args){
  task.desc = args.value;
}

function addTask(task){
  var newId = ++appData.taskId;
  appData.taskList[newId] = {id: newId, desc: "", parentId: task.parentId,
                     doneness: false, subtasks: [], isProjHeader: false};

  //get Parent
  var parentTask = appData.taskList[task.parentId];
  var ixOfCurrTask = parentTask.subtasks.indexOf(task.id) + 1;
  //insert new task after current task
  parentTask.subtasks.splice(ixOfCurrTask, 0, newId);
  appData.focusTaskId = newId;
}

function deleteTask(task) {
  //remove task from parent's subtask list
  var parent = appData.taskList[task.parentId];
  var parentSubtasks = parent.subtasks
  var ix = parentSubtasks.indexOf(task.id);
  parentSubtasks.splice(ix, 1);

  //recursively delete task's subtasks
  delSubtasks(task);
}

function delSubtasks(task) {
  var taskId = task.id;
  var subTaskIds = task.subtasks
  if (subTaskIds) {
    subTaskIds.map(function(subTaskId){
      delSubtasks(appData.taskList[subTaskId]);
    })
  }
  delete appData.taskList[taskId];
}

function unsubTask(task){
  var parent = appData.taskList[task.parentId];
  if (parent.id != "root"){
    var parentParentId = parent.parentId;
    var parentParent = appData.taskList[parentParentId];

    //insert current task after it's previous parent under the now shared parent
    var ixParent = parentParent.subtasks.indexOf(parent.id);
    parentParent.subtasks.splice(ixParent+1, 0, task.id);
    task.parentId = parentParentId;

    //remove current task from it's previous parent subtask list
    var ixTask = parent.subtasks.indexOf(task.id);
    parent.subtasks.splice(ixTask, 1);
    appData.focusTaskId = task.id;
  }
}

function subTask(task){
  var parent = appData.taskList[task.parentId];

  var ixTask = parent.subtasks.indexOf(task.id)
  //Make currtask subtask of whatever task is "before" it. If there is no task "before" it, don't subtask
  if (ixTask !== 0) {
    var newParentId = parent.subtasks[ixTask-1]
    var newParent = appData.taskList[newParentId]
    newParent.subtasks.push(task.id)

    task.parentId = newParentId
    parent.subtasks.splice(ixTask, 1)
  }
  appData.focusTaskId = task.id;
}

function toggleDone(task){
  task.doneness = !task.doneness;
}

function isProjToggle(task) {
  task.isProjHeader = !task.isProjHeader;
  if (task.isProjHeader) {
    appData.projectList.push(task.id);
  }
  else {
    var ix = appData.projectList.indexOf(task.id);
    appData.projectList.splice(ix, 1);
  }
}

function setDate(task, args) {
  task.duedate = args.value;
}

function toggleSelected(task) {
  task.isSelected = !task.isSelected;
}

function gotoProject(task) {
    appData.projRootId = appData.projRootId === "root" ? task.id : "root";
}

function massAssignDate(args) {
  for (var taskId in appData.taskList) {
    if (appData.taskList[taskId].isSelected == true) {
      appData.taskList[taskId].duedate = args.value;
      appData.taskList[taskId].isSelected = false;
    }
  }
}



//---------------------------------------------------------
// Individual task component
//---------------------------------------------------------

var Task = React.createClass({
  save: function(e) {
    eventDispatch("save", this.props.task, {value: e.target.value});
  },
  handleKey: function(e) {
    //add task
    if (e.keyCode === 13) {
      eventDispatch("addTask", this.props.task);
    }
    //un-subtask
    else if (e.shiftKey && e.keyCode === 9) {
      e.preventDefault();
      eventDispatch("unsubTask", this.props.task);
    }
    //subtask
    else if (e.keyCode === 9) {
      e.preventDefault();
      eventDispatch("subTask", this.props.task);
    }
    //mark done
    else if (e.ctrlKey && e.keyCode === 68) {
      eventDispatch("toggleDone", this.props.task);
    }
    //delete
    else if (e.ctrlKey && e.keyCode === 8) {
      e.preventDefault();
      eventDispatch("delete", this.props.task);
    }
    else if (e.shiftKey && e.keyCode === 186){
      eventDispatch("isProjToggle", this.props.task);
    }
  },
  gotoProject: function() {
    eventDispatch("gotoProject", this.props.task);
//     projRootId = projRootId === "root" ? this.props.task.id : "root";
  },
  handleDateKeys: function(e) {
    eventDispatch("setDate", this.props.task, {value: e.target.value});
  },
  toggleSelected: function() {
    eventDispatch("toggleSelected", this.props.task);
  },
  componentDidMount: function() {
    if (this.props.task.id === appData.focusTaskId) {
      React.findDOMNode(this.refs.tasks).focus();
    }
  },
  render: function() {
    var task = this.props.task;

    //If task is done and viewDone is not set, don't display
    if (task.doneness && !appData.viewDone) {
      return null;
    }

    //Setting classname for css
    var className = task.doneness ? "done " : "";
    className += task.isProjHeader ? "projHeader " : "";

    var gotoProj;
    if (task.isProjHeader) {
      gotoProj = <button
                    name="button"
                    onClick={this.gotoProject}>
                 </button>
    }


    var subtasks = task.subtasks.map(function(taskId){
      return <Task task={appData.taskList[taskId]}
                   key={taskId}
                   viewDone={appData.viewDone} />
    })

    return <li>
              {gotoProj}
              <input
                className="assignDate"
                type="checkbox"
                checked={task.isSelected}
                onChange={this.toggleSelected}
                >
              </input>
              <input
                className={className}
                ref="tasks"
                onKeyDown={this.handleKey}
                onInput={this.save}
                value={task.desc}>
              </input>
              <input
                onInput={this.handleDateKeys}
                value={task.duedate}>
              </input>
              <ul>
                {subtasks}
              </ul>
           </li>
  }
});

var TaskListFilters = React.createClass({
  handleUserInput: function() {
    appData.viewDone = this.refs.viewDoneCheck.getDOMNode().checked;
    draw();
  },
  render: function() {
    return (
          <input
            ref="viewDoneCheck"
            type="checkbox"
            onChange={this.handleUserInput}>
            View Done
          </input>
    );
  }
});

var TaskList = React.createClass({
  render: function() {
    if (appData.projRootId === "root") {
      var roots = this.props.tasks[appData.projRootId].subtasks;
      var tasks = roots.map(function(taskId){
        return <Task task={appData.taskList[taskId]}
                     key={taskId}
                     viewDone={appData.viewDone} />
      })
    }
    else {
      var tasks = <Task task={appData.taskList[appData.projRootId]}
                        viewDone={appData.viewDone} />
    }

    return <ul>
              {tasks}
           </ul>
  },
});


var FilterTaskList = React.createClass({
  render: function() {
    return (
      <div>
          <TaskListFilters />
          <TaskList tasks={this.props.tasks} />
      </div>
      );
  }
});

var AssignDate = React.createClass({
  assignDate: function(e) {
    if (e.keyCode === 13) {
      eventDispatch("massAssignDate", null, {value: e.currentTarget.value});
    }
  },
  render: function() {
    return (
      <input
        type="text"
        onKeyDown={this.assignDate}>
      Assign Date
      </input>
    )
  }
});

var ProjView = React.createClass({
  render: function() {
    return (
      <div>
        <AssignDate tasks={this.props.tasks}/>
        <FilterTaskList tasks={this.props.tasks}
                        viewDone={appData.viewDone} />
      </div>
    )
  }
});


function init() {
  if (localStorage["appData"]) {
    appData = JSON.parse(localStorage["appData"]);
  }
  draw();
}

init();

function draw(){
  React.render(<ProjView tasks={appData.taskList} />, node);
}

// localStorage.clear();
