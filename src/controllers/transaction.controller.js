import User from "../model/user.model.js";
import Wallet from "../model/wallet.model.js";
import Transaction from "../model/transaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Op, Sequelize, and } from "sequelize";
import cron from "node-cron";

import { quickAddJob } from "graphile-worker";
import { sequelize } from "../db/index.js";

let makeIncome = asyncHandler(async (req, res) => {
  let { amount, category, description, associatedWallet } = req?.body;
  let user = req?.user;
  if (!(amount && category && associatedWallet)) {
    throw new ApiError(500, "amount,category and associatedWallet is required");
  }

  let wallet = await Wallet.findByPk(associatedWallet);
  if (!wallet) {
    throw new ApiError(500, "Invalid wallet");
  }

  if (wallet.userId !== user.id) {
    throw new ApiError(500, "Invalid user trying to update wallet");
  }

  let transaction = await Transaction.create({
    amount: parseInt(amount),
    category: category,
    description: description || "",
    associatedWallet: associatedWallet,

    type: "I",
  });

  if (!transaction) {
    throw new ApiError(
      500,
      "Something went wrong while making transaction entry in db"
    );
  }

  let updatedWallet = await wallet.update({
    balance: parseInt(parseInt(wallet.balance) + parseInt(amount)),
  });

  if (!updatedWallet) {
    transaction.destroy();
    throw new ApiError(500, "Something went wrong while updating wallet in db");
  }

  let response = new ApiResponse(200, "Transaction made successfully", {
    transaction,
    wallet,
  });
  res.status(200).json(response);
});

let makeExpense = asyncHandler(async (req, res) => {
  let { amount, category, description, associatedWallet } = req?.body;
  let user = req?.user;
  if (!(amount && category && associatedWallet)) {
    throw new ApiError(500, "amount,category and associatedWallet is required");
  }

  let wallet = await Wallet.findByPk(associatedWallet);
  if (!wallet) {
    throw new ApiError(500, "Invalid wallet");
  }

  if (wallet.userId !== user.id) {
    throw new ApiError(500, "Invalid user trying to update wallet");
  }

  let transaction = await Transaction.create({
    amount: parseInt(amount),
    category: category,
    description: description || "",
    associatedWallet: associatedWallet,

    type: "E",
  });

  if (!transaction) {
    throw new ApiError(
      500,
      "Something went wrong while making transaction entry in db"
    );
  }
  wallet.balance -= parseInt(amount);
  if (wallet.balance < 0) {
    transaction.destroy();
    throw new ApiError(500, "Insufficient balance");
  }
  let updatedWallet = await wallet.save();

  if (!updatedWallet) {
    transaction.destroy();
    throw new ApiError(500, "Something went wrong while updating wallet in db");
  }

  let response = new ApiResponse(200, "Transaction made successfully", {
    transaction,
    wallet,
  });
  res.status(200).json(response);
});

let makeTransfer = asyncHandler(async (req, res) => {
  let { acc1Id, acc2Id, amount, category, description } = req?.body;
  let user = req?.user;

  let wallet1 = await Wallet.findByPk(acc1Id);
  let wallet2 = await Wallet.findByPk(acc2Id);

  if (!(wallet1 || wallet2)) {
    throw new ApiError(500, "Invalid wallet");
  }

  if (wallet1.userId !== user.id || wallet2.userId !== user.id) {
    throw new ApiError(500, "Invalid user trying to update wallet");
  }
  wallet1.balance -= parseInt(amount);
  if (wallet1.balance < 0) {
    throw new ApiError(500, "Insufficient balance to transfer");
  }
  wallet2.balance += parseInt(amount);

  let updatedWallet1 = await wallet1.save();

  if (!updatedWallet1) {
    throw new ApiError(501, "Something went wrong while transfering amount");
  }
  let updatedWallet2 = await wallet2.save();
  if (!updatedWallet2) {
    wallet1.balance += parseInt(amount);
    await wallet1.save();
    throw new ApiError(501, "Something went wrong while transfering amount");
  }
  let transaction = await Transaction.create({
    amount: parseInt(amount),
    category: "Transfer",
    description: description || "",
    associatedWallet: wallet1.id,

    type: "E",
  });
  if (!transaction) {
    wallet1.balance += parseInt(amount);
    await wallet1.save();
    wallet2.balance -= parseInt(amount);
    await wallet2.save();
  }
  let transaction2 = await Transaction.create({
    amount: parseInt(amount),
    category: "Transfer",
    description: description || "",
    associatedWallet: wallet2.id,

    type: "I",
  });

  if (!transaction2) {
    wallet1.balance += parseInt(amount);
    await wallet1.save();
    wallet2.balance -= parseInt(amount);
    await wallet2.save();
    await transaction.destroy();
  }
  let response = new ApiResponse(200, "Transaction made successfully", {
    updatedWallet1,
    updatedWallet2,
  });
  res.status(200).json(response);
});

let getTodayTransaction = asyncHandler(async (req, res) => {
  let user = req?.user;
  let { walletId } = req?.body;
  let today = new Date();
  let transactions = await Transaction.findAll({
    where: {
      associatedWallet: walletId,
      createdAt: {
        [Op.gte]: today.setHours(0, 0, 0, 0),
        [Op.lte]: today.setHours(23, 59, 59, 999),
      },
    },
  });
  let response = new ApiResponse(200, "Transaction made successfully", {
    transactions,
  });
  res.status(200).json(response);
});

let scheduleTransaction = asyncHandler(async (req, res) => {
  let {
    amount,
    type,
    category,
    description,
    repeatFrequency,
    repeat,
    endAfterFrequency,
    associatedWallet,
    endAftertime,
  } = req?.body;
  console.log(
    amount,
    type,
    category,
    description,
    repeatFrequency,

    associatedWallet,
    endAftertime
  );
  if (repeatFrequency == "D") {
    repeatFrequency = 1000 * 60 * 60 * 24;
  } else if (repeatFrequency == "W") {
    repeatFrequency = 1000 * 60 * 60 * 24 * 7;
  } else if (repeatFrequency == "M") {
    repeatFrequency = 1000 * 60 * 60 * 24 * 30;
  } else if (repeatFrequency == "Y") {
    repeatFrequency = 1000 * 60 * 60 * 24 * 365;
  }
  console.log(repeatFrequency);
  let user = req?.user;

  if (!(amount && category && associatedWallet)) {
    throw new ApiError(500, "amount,category and associatedWallet is required");
  }

  let wallet = await Wallet.findByPk(associatedWallet);
  if (!wallet) {
    throw new ApiError(500, "Invalid wallet");
  }

  if (wallet.userId !== user.id) {
    throw new ApiError(500, "Invalid user trying to update wallet");
  }

  let transaction = await Transaction.create({
    amount: parseInt(amount),
    category: category,
    description: description || "",
    associatedWallet: associatedWallet,

    type,
  });

  if (!transaction) {
    throw new ApiError(
      500,
      "Something went wrong while making transaction entry in db"
    );
  }

  if (type == "I") {
    let updatedWallet = await wallet.update({
      balance: parseInt(parseInt(wallet.balance) + parseInt(amount)),
    });

    if (!updatedWallet) {
      transaction.destroy();
      throw new ApiError(
        500,
        "Something went wrong while updating wallet in db"
      );
    }
  } else if (type == "E") {
    wallet.balance -= parseInt(amount);
    if (wallet.balance < 0) {
      transaction.destroy();
      throw new ApiError(500, "Insufficient balance");
    }
    let updatedWallet = await wallet.save();
  }
  const startTime = new Date().getTime();
  const endTime = new Date(endAftertime).getTime();
  const options = {
    connectionString: process.env.CONNECTION_STRING,
  };
  console.log(`repeat ${repeatFrequency} ,end time: ${endTime} `);
  let interval = setInterval(() => {
    let currentTime = new Date().getTime();
    console.log(currentTime);
    if (currentTime > endTime) {
      console.log("cleared interval");
      clearInterval(interval);
      return;
    }
    quickAddJob(
      options,
      "transactionJob",
      {
        amount,
        type,
        category,
        description,
        associatedWallet,
        wallet,
        user,
        repeat,
        endAftertime,
      },
      { jobKey: `job_no_${endAfterFrequency}` }
    );
  }, repeatFrequency);

  res.json("scheduled");
});

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getStartOfWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  const distanceToMonday = (dayOfWeek + 6) % 7; // Calculate days to Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0); // Set time to 12 AM
  return monday;
}

function getStartOfMonth() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0); // Set time to 12 AM
  return firstDay;
}

function getStartOfYear() {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // Month is 0-based, so 0 is January
  firstDayOfYear.setHours(0, 0, 0, 0); // Set time to 12 AM
  return firstDayOfYear;
}

const truncateDescription = (description, wordLimit) => {
  const words = description.split(" ");
  if (words.length <= wordLimit) {
    return description;
  }
  return words.slice(0, wordLimit).join(" ") + "...";
};
const sendTransactionBetweenDate = asyncHandler(async (req, res) => {
  let { tillDate, limit, offset, wallets } = req?.body;
  let walletIdList = new Set();
  wallets.map((wallet) => {
    if (wallet.userId !== req.user.id) {
      throw new ApiError(500, "This wallet does not belong to your account");
    } else {
      walletIdList.add(wallet.id);
    }
  });
  if (walletIdList.length == 0) {
    throw new ApiError(500, "This account has no wallet, please create a one");
  }
  let TillTime;
  if (tillDate == "Today") {
    TillTime = getStartOfToday();
  } else if (tillDate == "Week") {
    TillTime = getStartOfWeek();
  } else if (tillDate == "Month") {
    TillTime = getStartOfMonth();
  } else if (tillDate == "Year") {
    TillTime = getStartOfYear();
  }

  let transactionBetween = await Transaction.findAll({
    where: {
      createdAt: {
        [Op.gte]: TillTime,
        [Op.lte]: new Date(),
      },
      associatedWallet: {
        [Op.in]: Array.from(walletIdList),
      },
    },
    limit: limit,
    offset: offset,
    order: [["createdAt", "DESC"]],
  });

  transactionBetween = transactionBetween.map((transaction) => {
    return {
      ...transaction.get(),
      description: truncateDescription(transaction.description, 4),
    };
  });
  if (!transactionBetween) {
    throw new ApiError("Transaction not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Transaction made successfully", {
      transactionBetween,
    })
  );
});

const sendIncome = asyncHandler(async (req, res) => {
  let { associatedWalletList,month } = req?.body;
 let between = getMonthStartEndTimes(month,2024)
 console.log(between);
  let Income = 0;
  let Expense = 0;
  const verify = await Promise.all(
    associatedWalletList.map(async (walletId) => {
      if (walletId?.userId !== req?.user.id) {
        throw new ApiError(500, "Invalid user trying");
      }

      let incomeTransaction = await Transaction.findAll({
        where: {
          associatedWallet: walletId.id,
          type: "I",
          createdAt: {
            [Op.gte]: between.firstDay,
            [Op.lte]: between.lastDay,
          },
        },
      });

      let expenseTransaction = await Transaction.findAll({
        where: {
          associatedWallet: walletId.id,
          type: "E",
          createdAt: {
            [Op.gte]: between.firstDay,
            [Op.lte]: between.lastDay,
          },
        },
      });

      console.log("Income and expense record , " + incomeTransaction);
      incomeTransaction.forEach((transaction) => {
        Income += transaction.dataValues.amount;
      });

      expenseTransaction.forEach((transaction) => {
        Expense += transaction.dataValues.amount;
      });
    })
  );
  console.log("log of income", Income);
  res.status(200).json(
    new ApiResponse(200, "Transaction made successfully", {
      Income,
      Expense,
    })
  );
});
function getMonthStartEndTimes(month, year) {
  const months = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  if (!months.hasOwnProperty(month)) {
    throw new ApiError(500,"Invalid month",{month})
  }

  const monthIndex = months[month];
  year = year || new Date().getFullYear(); // Default to current year if not provided

  // First day of the month at 12:00 AM
  const firstDay = new Date(year, monthIndex, 1);
  firstDay.setHours(0, 0, 0, 0);

  // Last day of the month at 11:59 PM
  const lastDay = new Date(year, monthIndex + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  return {
    firstDay,
    lastDay,
  };
}

// Example usage

const FilterResults = asyncHandler(async (req, res) => {
  let {
    filterBy,
    orderBy,
    filterByCategory,
    forOrder,
    limit,
    offset,
    month,
    wallets,
  } = req?.body;
  let walletIdList = new Set();
  wallets.map((wallet) => {
    if (wallet.userId !== req.user.id) {
      throw new ApiError(500, "This wallet does not belong to your account");
    } else {
      walletIdList.add(wallet.id);
    }
  });
  if (walletIdList.length == 0) {
    throw new ApiError(500, "This account has no wallet, please create a one");
  }
  let whereClause = {};
  let orderClause = [];
  let between = getMonthStartEndTimes(month);

  if (filterByCategory) {
    whereClause.category = filterByCategory;
  }
  whereClause.associatedWallet = {
    [Op.in]: Array.from(walletIdList),
  };
  if (filterBy) {
    whereClause.type = filterBy;
  }

  if (forOrder && orderBy) {
    orderClause.push([forOrder, orderBy]);
  }
  whereClause.createdAt = {
    [Op.gte]: between.firstDay,
    [Op.lte]: between.lastDay,
  };
  console.log(limit, offset);
  console.log("whereClause:", whereClause); // Log the where clause
  console.log("orderClause:", orderClause); // Log the order clause
  let filteredResults = await Transaction.findAll({
    where: whereClause,
    order: orderClause,
    limit: limit,
    offset: offset,
  });

  // Handle the filtered results
  res.status(200).json({
    message: "Filtered results fetched successfully",
    data: filteredResults,
  });
});

//send the category wise details to the user within the specified month

const categoryWiseDetails = asyncHandler(async (req, res) => {
  let { month, wallets } = req?.body;

  let walletIdList = new Set(); //set of unique wallet id
  wallets.map((wallet) => {
    //check if wallet belong to us or not
    if (wallet.userId !== req.user.id) {
      throw new ApiError(500, "This wallet does not belong to your account");
    } else {
      walletIdList.add(wallet.id);
    }
  });
  if (walletIdList.length == 0) {
    //if no wallet then no transactions
    throw new ApiError(500, "This account has no wallet, please create a one");
  }
  let whereClause = {};

  let between = getMonthStartEndTimes(month);

  whereClause.associatedWallet = {
    //only shows the wallet which belong to us
    [Op.in]: Array.from(walletIdList),
  };

  whereClause.createdAt = {
    // filters transaction between the month in which they are requested
    [Op.gte]: between.firstDay,
    [Op.lte]: between.lastDay,
  };

  let filteredResults = await Transaction.findAll({
    where: whereClause,
    attributes: [
      "category",
      "type",
      [sequelize.fn("SUM", sequelize.col("amount")), "total"],
    ],

    group: ["category", "type"],
    order: [[Sequelize.fn("SUM", Sequelize.col("amount")), "DESC"]],
    // raw: true, // to avoid sequelize default json format
  });
  console.log("frresult", filteredResults);
  let expense = 0;
  let income = 0;
  filteredResults.map((item) => {
    if (item.dataValues.type == "I") {
      income += Number(item.dataValues.total);
      console.log(item.dataValues);
    } else if (item.dataValues.type == "E") {
      expense += Number(item.dataValues.total);
    }
  });

  res
    .status(220)
    .json(
      new ApiResponse(
        220,
        { filteredResults, expense, income },
        "All transaction fetched successfully"
      )
    );
});

export {
  makeIncome,
  makeExpense,
  makeTransfer,
  getTodayTransaction,
  scheduleTransaction,
  sendTransactionBetweenDate,
  sendIncome,
  FilterResults,
  categoryWiseDetails,
};
