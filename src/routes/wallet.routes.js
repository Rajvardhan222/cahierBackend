import { Router } from "express";
import { createwallet, getUserWallet, getWalletById, updateWalletAdd, updateWalletLess } from "../controllers/wallet.controller.js";
import {varifyJWT} from "../middlewares/Auth.middleware.js"
const router = Router()

router.route("/createWallet").post(varifyJWT,createwallet)
router.route("/userWallet").post(varifyJWT,getUserWallet)
router.route("/getUserwalletbyId").post(varifyJWT,getWalletById)
router.route("/addMoneyToWallet").patch(varifyJWT,updateWalletAdd)
router.route("/lessMoneyToWallet").patch(varifyJWT,updateWalletLess)

export default router