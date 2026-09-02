import mongoose, { Schema } from "mongoose";
import { TASK_PRIORITY, TASK_STATUS } from "../constants/task.constants.js";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            minLength: [3, "Title must be atleast 3 characters"],
            maxLength: [100, "Title cannot exceed 100 characters"]
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxLength: 500
        },
        status: {
            type: String,
            enum: TASK_STATUS,
            default: "todo"
        },
        priority: {
            type: String,
            enum: TASK_PRIORITY,
            default: "medium"
        },
        dueDate: {
            type: Date
        },
        order: {
            type: Number,
            default: 0
        },
        owner: {
            type:Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

taskSchema.index({
    owner: 1,
    status: 1,
    order: 1,
});

export const Task = mongoose.model("Task", taskSchema);