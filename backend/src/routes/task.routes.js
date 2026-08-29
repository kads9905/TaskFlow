import { Router } from "express";
import { 
    createTask,
    deleteTask,
    getBoard,
    updateTask
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(
    verifyJWT,
    createTask
)

// get all the tasks(board)
router.route("/").get(
    verifyJWT,
    getBoard
)

router.route("/:taskId").patch(
    verifyJWT,
    updateTask
)

router.route("/:taskId").delete(
    verifyJWT,
    deleteTask
)

export default router;