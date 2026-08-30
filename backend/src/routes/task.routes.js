import { Router } from "express";
import { 
    createTask,
    deleteTask,
    getBoard,
    getTaskStats,
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

// instead of calculating counts in react
// backedn returns them directly
// total tasks, in progress, todo, done
router.route("/stats").get(
    verifyJWT,
    getTaskStats
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