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

export {
    createTask
}