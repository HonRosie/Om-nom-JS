var node = document.getElementById("taskList");

function toggleDone(task){
  task.doneness = !task.doneness;
}

function save(task, args){
  task.desc = args.value;
}

function addTask(task){
  var newId = ++taskId;
  taskList[newId] = {id: newId, desc: "", parentId: task.parentId,
                     doneness: false, subtasks: [], isProjHeader: false};
  var parent = taskList[task.parentId];
  var ix = parent.subtasks.indexOf(task.id) + 1;
  parent.subtasks.splice(ix, 0, newId);
  focusTaskId = newId;
}

function unsubTask(task){
  var parent = taskList[task.parentId];
  if (parent.id != "root"){
    var parentParentId = parent.parentId;
    var parentParent = taskList[parentParentId];

    var ixParent = parentParent.subtasks.indexOf(parent.id);
    parentParent.subtasks.splice(ixParent+1, 0, task.id);
    task.parentId = parentParentId;

    var ixTask = parent.subtasks.indexOf(task.id);
    parent.subtasks.splice(ixTask, 1);
    focusTaskId = task.id;
  }
}

function subTask(task){
  var parent = taskList[task.parentId];

  var ixTask = parent.subtasks.indexOf(task.id)
  if (ixTask !== 0) {
    var newParentId = parent.subtasks[ixTask-1]
    var newParent = taskList[newParentId]
    newParent.subtasks.push(task.id)

    task.parentId = newParentId
    parent.subtasks.splice(ixTask, 1)
  }
  focusTaskId = task.id;
}

function deleteTask(task) {
  var parentId = task.parentId;
  var ix = taskList[parentId].subtasks.indexOf(task.id);
  taskList[parentId].subtasks.splice(ix, 1);

  delTask(task);

}

function delTask(task) {
  var taskId = task.id;
  var subTaskIds = task.subtasks
  if (subTaskIds) {
    subTaskIds.map(function(subTaskId){
      delTask(taskList[subTaskId]);
    })
  }
  delete taskList[taskId];
}

function toggleProject(task) {
  task.isProjHeader = !task.isProjHeader;
  if (task.isProjHeader) {
    projectList.push(task.id);
  }
  else {
    var ix = projectList.indexOf(task.id);
    projectList.splice(ix, 1);
  }
}

function setDate(task, args) {
  task.duedate = args.value;
}

function assignDate(task) {
  task.toAssignDate = true;
}


function eventDispatch(action, task, args){
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
    case "toggleProject":
      toggleProject(task);
      break;
    case "setDate":
      setDate(task, args);
      break;
    case "assignDate":
      assignDate(task);
      break;
  }
}

var Task = React.createClass({
  save: function(e) {
    eventDispatch("save", this.props.task, {value: e.target.value});
    draw();
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
      eventDispatch("toggleProject", this.props.task);
    }
    draw();
  },
  handleButton: function() {
    projRootId = projRootId === "root" ? this.props.task.id : "root";
    draw();
  },
  handleDateKeys: function(e) {
    eventDispatch("setDate", this.props.task, {value: e.target.value});
    draw();
  },
  assignDate: function() {
    eventDispatch("assignDate", this.props.task);
  },
  componentDidMount: function() {
    if (this.props.task.id === d) {
      React.findDOMNode(this.refs.tasks).focus();
    }
  },
  render: function() {
    var task = this.props.task;
    var gotoProj;
    var duedate;

    if (task.doneness && !viewDone) {
      return null;
    }
    else {
      var cName = task.doneness ? "done " : "";
      cName += task.isProjHeader ? "projHeader " : "";

      if (task.isProjHeader) {
        gotoProj = <button
                      name="button"
                      onClick={this.handleButton}>
                   </button>
      }


      var subtasks = task.subtasks.map(function(taskId){
        return <Task task={taskList[taskId]}
                     viewDone={viewDone} />
      })

      return <li>
                {gotoProj}
                <input
                  className="assignDate"
                  type="checkbox"
                  checked={task.toAssignDate}
                  onChange={this.assignDate}
                  >
                </input>
                <input
                  className={cName}
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
  }
});

var TaskListFilters = React.createClass({
  handleUserInput: function() {
    viewDone = this.refs.viewDoneCheck.getDOMNode().checked;
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
    if (projRootId === "root") {
      var roots = this.props.tasks[projRootId].subtasks;
      var tasks = roots.map(function(taskId){
        return <Task task={taskList[taskId]}
                     viewDone={viewDone} />
      })
    }
    else {
      var tasks = <Task task={taskList[projRootId]}
                        viewDone={viewDone} />
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
    var roots = this.props.tasks["root"].subtasks;
    roots.map(function(taskId){
      if (taskList[taskId].toAssignDate == true) {
        taskList[taskId].duedate = "foo"
        taskList[taskId].toAssignDate = false
      }
      draw();
    })
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
                        viewDone={viewDone} />
      </div>
    )
  }
});

var projRootId = "root";
var viewDone = false;
// localStorage.clear();

//Setting up task Ids and reloading from local storage
var taskId = 0;
if(localStorage["taskId"]) {
  taskId = JSON.parse(localStorage["taskId"]);
}

//Setting up tasklist structure and reloading it from local storage
var projectList = [];
var d = 0;
var taskList = {"root": {id: "root", subtasks: [0]},
                0: {id: 0, desc: "", parentId: "root", doneness: false,
                    subtasks: [], isProjHeader: true, duedate: "", toAssignDate: false}};

if(localStorage["taskList"]) {
  taskList = JSON.parse(localStorage["taskList"]);
}

function draw(){
  localStorage["taskId"] = JSON.stringify(taskId);
  localStorage["taskList"] = JSON.stringify(taskList);
  React.render(<ProjView tasks={taskList} />, node);
}

draw();
