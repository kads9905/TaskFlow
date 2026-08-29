import { Router } from "express";
import { 
    createTask,
    getBoard
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



export default router;