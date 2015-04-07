# Om-nom-JS
OmnomJS is a web application built using JavaScript and React that is a personal life manager of sorts. It helps me track my tasks, and any questions or interesing learnings I come across as I work on my projects.

This was a rebuild of Om nom, and continuing development for the web application will occur under OmnomJS.

Currently the application is entirely client side with tasks stored in a data structure and saved to the browser cache.

##Instructions to run
To run OmnomJS
Assuming you already have React setup, input the file path to where index.html is on your machine.


##Supported features so far
* Save task
    * Tasks are automatically saved as you go
* New task creation
    * <kbd>Enter</kbd> from an existing task
* Subtask creation (theoretically you can create infinity levels of subtasks)
    * <kbd>Tab</kbd> on any task to subtask
    * <kbd>Shift</kbd>+<kbd>Tab</kbd> to unsubtask something
* Mark tasks done
    * <kbd>Ctrl</kbd>+<kbd>d</kbd>. This will mark tasks red and remove them from the list
* Toggle to see done tasks
    * Check the box "View Done". This will bring back all done tasks in red.
* Recursive delete
    * <kbd>Ctrl</kbd>+<kbd>Delete</kbd>
* Create Projects
    * <kbd>:</kbd> at the end of a task toggles it into a project. The description will turn green. <kbd>:</kbd> again toggles it back to a normal task. You can keep doing this and currently you'll just accumulate a bunch of colons at the end of your task, which can just be deleted without consequence.
* Drill down to a specific project
    * Click on the little box to drill into a project, or to return back to the full task list
* Set project due date
    * Type the due date in the input box next to each task



##Future work
* Be able to assign duedates to multiple tasks at a time
* Build a daily view. Displays the day's tasks, as well as be able to jot down any questions and learnings I came across during the day
* Be able to auto-create a daily view from the task list, by selecting which tasks I wanted to complete that day

Eventually I’d like to build a Python server for it and potentially hook it up to a db.
