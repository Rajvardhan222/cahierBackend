import { Sequelize, DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";
import User from "./user.model.js";
const Wallet = sequelize.define("Wallet", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance: { type: DataTypes.INTEGER, defaultValue: 0 },

  accountType: {
    type: DataTypes.STRING,
    defaultValue: "wallet",
    validate: { isIn: [["wallet", "Bank", "UPI", "PhonePe", "paytm"]] },
   
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      Model: User, 
      key: "id",
    },
  },
});

export default Wallet;
