import mongoose from "mongoose";

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
            enum: ["todo", "inprogress", "done"],
            default: "todo"
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        dueDate: {
            type: Date
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Task = mongoose.model("Task", taskSchema);