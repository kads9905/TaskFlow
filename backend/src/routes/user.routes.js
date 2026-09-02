import { Router } from "express";
import { 
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/register").post(
    upload.single("avatar"),
    registerUser
)

router.route("/login").post(
    loginUser
)

router.route("/current-user").get(
    verifyJWT,
    getCurrentUser
)

router.route("/logout").post(
    verifyJWT,
    logoutUser
)

export default router;