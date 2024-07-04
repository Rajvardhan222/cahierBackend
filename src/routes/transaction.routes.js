import { Router } from "express";
import { varifyJWT } from "../middlewares/Auth.middleware.js";
import {
  FilterResults,
  categoryWiseDetails,
  getTodayTransaction,
  makeExpense,
  makeIncome,
  makeTransfer,
  scheduleTransaction,
  sendIncome,
  sendTransactionBetweenDate,
} from "../controllers/transaction.controller.js";

let router = Router();

router.route("/addIncome").post(varifyJWT, makeIncome);
router.route("/addExpense").post(varifyJWT, makeExpense);
router.route("/transfer").post(varifyJWT, makeTransfer);
router.route("/todayTransaction").post(varifyJWT, getTodayTransaction);
router.route("/sch").post(varifyJWT, scheduleTransaction);
router
  .route("/sendTransactionBetween")
  .post(varifyJWT, sendTransactionBetweenDate);
router.route("/getIncome").post(varifyJWT, sendIncome);
router.route("/filterResult").post(varifyJWT, FilterResults);
router.route("/categoryDetails").post(varifyJWT, categoryWiseDetails);

export default router;
