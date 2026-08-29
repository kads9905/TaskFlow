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





export {
    createTask,
    getBoard
}