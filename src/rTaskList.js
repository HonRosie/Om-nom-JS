var node = document.getElementById("taskList");

function toggleDone(task){
  task.doneness = !task.doneness;
  draw();
}

var Task = React.createClass({
  toggleDone: function() {
    this.props.task.doneness = !this.props.task.doneness;
    draw();
  },
  save: function(e) {
    this.props.task.desc = e.target.value;
    draw();
  },
  handleKey: function(e) {
    //add task
    if (e.keyCode === 13) {
      var task = this.props.task;
      console.log(task.parentId);
      var newId = ++taskId;
      taskList[newId] = {id: newId, desc: "", parentId: task.parentId, doneness: false, subtasks: []};

      var parent = taskList[task.parentId];
      var ix = parent.subtasks.indexOf(task.id) + 1;
      parent.subtasks.splice(ix, 0, newId);
    }
    //un-subtask
    else if (e.shiftKey && e.keyCode === 9) {
      e.preventDefault();
      var task = this.props.task;
      var parent = taskList[task.parentId];
      var parentParentId = parent.parentId;
      var parentParent = taskList[parentParentId];

      var ixParent = parentParent.subtasks.indexOf(parent.id);
      parentParent.subtasks.splice(ixParent+1, 0, task.id);
      task.parentId = parentParentId;

      var ixTask = parent.subtasks.indexOf(task.id);
      parent.subtasks.splice(ixTask, 1);
    }
    //subtask
    else if (e.keyCode === 9) {
      e.preventDefault();
      var task = this.props.task;
      var parent = taskList[task.parentId];

      var ixTask = parent.subtasks.indexOf(task.id)
      if (ixTask !== 0) {
        var newParentId = parent.subtasks[ixTask-1]
        var newParent = taskList[newParentId]
        newParent.subtasks.push(task.id)

        task.parentId = newParentId
        parent.subtasks.splice(ix, 1)
      }
    }
    else if (e.ctrlKey && e.keyCode === 68) {
      console.log("helllllllllllo")
      toggleDone(this.props.task.value)
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
