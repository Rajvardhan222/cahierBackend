import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

let router = Router()
router.route('/regester').post(registerUser)
export default router