import { Task } from "../models/task.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTask = asyncHandler(async(req, res) => {
    // extract the data
    const { title, description, priority, dueDate } = req.body

    if(!title?.trim()){
        throw new ApiError(400, "Task title is required");
    }

    // create the task
    const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        owner: req.user._id
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
    }).sort({ createdAt: -1 });

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


export {
    createTask,
    getBoard,
    updateTask,
    deleteTask,
    getTaskStats
}