import { Sequelize, DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";
import Wallet from "./wallet.model.js";
let Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {isIn: [["I", "E", "T"]]},
  },
  repeat: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  frequency: DataTypes.DATE,
  repeatFrequency: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {isIn : [["D", "W", "M", "Y"]]},
  },
  endAfterFrequency: {
    type: DataTypes.DATE,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  category: {
    type: DataTypes.STRING,
    validate:{isIn : [
      [
        "Food",
        "Travel",
        "Education",
        "Entertainment",
        "Business",
        "Cloths",
        "Grocery",
        "Vegetable",
        "Electricity",
        "Transfer",
        "Tax",
        "Vegetable",
        "Technology",
        "Salary",
        "Rent",
        "Donation",
        "Medical",
        "Start"
      ],
    ]}
  },
  description: DataTypes.STRING,
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  associatedWallet: {
    type: DataTypes.INTEGER,
    references: {
      model: Wallet,
      key: "id",
    },
    allowNull: false,
  },
});

export default Transaction;
