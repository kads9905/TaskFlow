import { Router } from "express";
import { 
    createTask,
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



export default router;