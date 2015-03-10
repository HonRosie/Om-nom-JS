var node = document.getElementById("taskList");

function toggleDone(task){
  task.doneness = !task.doneness;
}

function save(task, args){
  task.desc = args.value;
}

function addTask(task){
  var newId = ++taskId;
  taskList[newId] = {id: newId, desc: "", parentId: task.parentId, doneness: false, subtasks: []};

  var parent = taskList[task.parentId];
  var ix = parent.subtasks.indexOf(task.id) + 1;
  parent.subtasks.splice(ix, 0, newId);
}

function unsubTask(task){
  var parent = taskList[task.parentId];
  var parentParentId = parent.parentId;
  var parentParent = taskList[parentParentId];

  var ixParent = parentParent.subtasks.indexOf(parent.id);
  parentParent.subtasks.splice(ixParent+1, 0, task.id);
  task.parentId = parentParentId;

  var ixTask = parent.subtasks.indexOf(task.id);
  parent.subtasks.splice(ixTask, 1);
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
    else if (e.ctrlKey && e.keyCode === 68) {
      eventDispatch("toggleDone", this.props.task)
    }
    draw();
  },
  render: function() {
    var task = this.props.task;
    var style = {color: task.doneness ? "red" : ""};
    var subtasks = task.subtasks.map(function(taskId){
      return <Task task={taskList[taskId]} />
    })
    return <li><input
                onKeyDown={this.handleKey}
                onInput={this.save}
                style={style}
                value={task.desc}></input>
                <ul>
                  {subtasks}
                </ul>
          </li>
  }
});

var TaskList = React.createClass({
  render: function() {
    var roots = this.props.tasks["root"].subtasks;

    var tasks = roots.map(function(taskId){
      return <Task task={taskList[taskId]} />
    })

    return <ul>{tasks}</ul>;
  },
});


localStorage.clear();

//Setting up task Ids and reloading from local storage
var taskId = 0;
if(localStorage["taskId"]) {
  taskId = JSON.parse(localStorage["taskId"]);
}

//Setting up tasklist structure and reloading it from local storage
var taskList = {"root": {id: "root", subtasks: [0]},
                0: {id: 0, desc: "", parentId: "root", doneness: false, subtasks: []}};
if(localStorage["taskList"]) {
  taskList = JSON.parse(localStorage["taskList"]);
}

function draw(){
  localStorage["taskId"] = JSON.stringify(taskId);
  localStorage["taskList"] = JSON.stringify(taskList);
  React.render(<TaskList tasks={taskList} />, node);
}

draw()
