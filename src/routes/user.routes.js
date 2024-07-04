import { Router } from "express";
import { logOut, loginUser, regenerateAccessToken, registerUser, verifyAccessToken, verifyOtp } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWT } from "../middlewares/Auth.middleware.js";
let router = Router()
router.route('/regester').post(registerUser)
router.route('/verifyOtp').post(upload.single("profileImage"),verifyOtp)
router.route('/login').post(loginUser)
router.route('/logout').post(varifyJWT,logOut)
router.route("/regenerateAccessToken").post(regenerateAccessToken)
router.route("/verifyAccessToken").post(varifyJWT,verifyAccessToken)
export default router