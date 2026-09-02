import { Task } from "../models/task.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TASK_PRIORITY, TASK_STATUS } from "../constants/task.constants.js";

const createTask = asyncHandler(async(req, res) => {
    // extract the data
    const { title, description, priority, dueDate } = req.body
    
    if(!title?.trim()) {
        throw new ApiError(400, "Task title is required");
    }   

    if(title.trim().length < 3) {
        throw new ApiError(400, "Title must be at least 3 characters");
    }

    if(title.trim().length > 100) {
        throw new ApiError(400, "Title cannot excedd 100 characters");
    }

    if(priority && !TASK_PRIORITY.includes(priority)) {
        throw new ApiError(400, "Invalid task priority");
    }


    if(!title?.trim()){
        throw new ApiError(400, "Task title is required");
    }

    const lastTask = await Task.findOne({
        owner: req.user._id,
        status: "todo",
    }).sort({ order: -1 });
    
    const newOrder = lastTask ? lastTask.order + 1 : 0;
    // create the task
    const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        owner: req.user._id,
        order: newOrder,
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201, task, "Task created successfully")
    )
})

// full kanban board(all task object)
const getBoard = asyncHandler(async(req, res) => {

    // task.find -> go to tasks collection and find documents of the logged in user
    // -1 means descending, so newest tasks comes first.
    const tasks = await Task.find({
        owner: req.user._id
    }).sort({ status: 1, order: 1 });

    // group the tasks into kanban columns
    // transform mongodb array into kanban board object
    const board = {
        todo: [],
        inprogress: [],
        done: []
    }

    tasks.forEach((task) => {
        board[task.status].push(task);
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, board, " Board fetched successfully")
    )

})

const updateTask = asyncHandler(async(req, res) => {

    // get the task id
    const { taskId } = req.params

    // read the new values
    const { status, title, description, priority, dueDate } = req.body

    if (title !== undefined) {
        if (!title.trim()) {
            throw new ApiError(400, "Task title cannot be empty");
        }

        if (title.trim().length < 3) {
            throw new ApiError(400, "Title must be at least 3 characters");
        }

        if (title.trim().length > 100) {
            throw new ApiError(400, "Title cannot exceed 100 characters");
        }
    }

    if (status && !TASK_STATUS.includes(status)) {
        throw new ApiError(400, "Invalid task status");
    }

    if (priority && !TASK_PRIORITY.includes(priority)) {
        throw new ApiError(400, "Invalid task priority");
    }

    // verify the task belongs to the logged in user
    const task = await Task.findOne({
        _id: taskId,
        owner: req.user._id
    })

    if(!task) {
        throw new ApiError(404, "Task not found")
    }

    // update only the fields that were sent
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, task, "Task Updated Successfully")
    )

})

const deleteTask = asyncHandler(async(req, res) => {
    // get the task id
    const { taskId } = req.params

    // authorizatiion + delete
    // Instead of doing findOne() and then deleteOne(), 
    // we can combine both into one query.
    // delete this task only if it belongs to the logged in user
    const task = await Task.findOneAndDelete({
        _id: taskId,
        owner: req.user._id
    })

    if(!task){
        throw new ApiError(404, "Task not found")
    }

    return res
    .status(200)
    .json(200, {}, "Task deleted successfully")
})

const getTaskStats = asyncHandler(async(req, res) => {

    // counting documents in mongoDB
    // earlier we used find() -> returns actual documents
    // here we dont need the tasks-we only need the number
    // so mongodb provides countDocuments which returns count instead of whole doc
    // why repeat owner every time? -> this is authorization filter
    // w/o it mongodb would count everyones todo tasks
    // with it count only my tasks

    // counts every task belonging to the user
    const total = await Task.countDocuments({
        owner: req.user._id
    })

    // counts task which has status todo
    const todo = await Task.countDocuments({
        owner: req.user._id,
        status: "todo"
    })

    // counts task with status inprogress
    const inprogress = await Task.countDocuments({
        owner: req.user._id,
        status: "inprogress"
    })

    // counts task with status done
    const done = await Task.countDocuments({
        owner: req.user._id,
        status: "done"
    })

    // checks only priority
    const highPriority = await Task.countDocuments({
        owner: req.user._id,
        priority: "high"
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, { total, todo, inprogress, done, highPriority },
            "Task statistics fetched successfully"
        )
    )
})

const reorderTask = asyncHandler(async(req, res) => {
    const { taskId, status, newOrder } = req.body;

    if (!TASK_STATUS.includes(status)) {
        throw new ApiError(400, "Invalid task status");
    }

    if (!Number.isInteger(newOrder) || newOrder < 0) {
        throw new ApiError(400, "Invalid task position");
    }

    const tasks = await Task.find({
        owner: req.user._id,
        status,
    }).sort({ order: 1 });
    // sort returns the complete order of tasks in ascending order if used 1

    // find the dragged task
    const taskIndex = tasks.findIndex(
        (task) => task._id.toString() === taskId
    );

    if(taskIndex === -1){
        throw new ApiError(404, "Task not found");
    }

    // splice (2,1) means remove 1 elemen starting from index 2 and
    // store the removed task in movedTask
    const [movedTask] = tasks.splice(taskIndex, 1);

    // insert at new position
    tasks.splice(newOrder, 0, movedTask);

    // renumber every task
    for (let i = 0; i < tasks.length; i++) {
        tasks[i].order = i;
        await tasks[i].save({ validateBeforeSave: false });
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tasks,
            "Tasks reordered successfully"
        )
    );

})

const moveTask = asyncHandler(async(req, res) => {
    const { taskId, sourceStatus, destinationStatus, newOrder } = req.body;

    // validate and find task
    if(
        !TASK_STATUS.includes(sourceStatus) ||
        !TASK_STATUS.includes(destinationStatus)
    ) {
        throw new ApiError(400, "Invalid task status");
    }
    // find task only of logged in user
    const task = await Task.findOne({
        _id: taskId,
        owner: req.user._id
    });

    if(!task){
        throw new ApiError(404, "Task not found")
    }

    // fetch source and destination columns
    const sourceTasks = await Task.find({
        owner: req.user._id,
        status: sourceStatus,
    }).sort({ order: 1 });

    const destinationTasks = await Task.find({
        owner: req.user._id,
        status: destinationStatus,
    }).sort({ order: 1 });

    // Validate destination position
    if (
        !Number.isInteger(newOrder) ||
        newOrder < 0 ||
        newOrder > destinationTasks.length
    ) {
        throw new ApiError(400, "Invalid destination position");
    }

    // find task inside source array
    const sourceIndex = sourceTasks.findIndex(
        (task) => task._id.toString() === taskId
    );

    if (sourceIndex === -1) {
        throw new ApiError(404, "Task not found in source column");
    }

    // remove it
    const [movedTask] = sourceTasks.splice(sourceIndex, 1);

    // change its status
    movedTask.status = destinationStatus;

    // insert into destination
    destinationTasks.splice(newOrder, 0, movedTask);

    //renumber source column
    for (let i = 0; i < sourceTasks.length; i++) {
        sourceTasks[i].order = i;
        await sourceTasks[i].save({ validateBeforeSave: false });
    }

    // renumber destination column
    for (let i = 0; i < destinationTasks.length; i++) {
        destinationTasks[i].order = i;
        await destinationTasks[i].save({ validateBeforeSave: false });
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                sourceTasks, destinationTasks
            },
            "Task moved successfully"
        )
    )

})


export {
    createTask,
    getBoard,
    updateTask,
    deleteTask,
    getTaskStats,
    reorderTask,
    moveTask
}