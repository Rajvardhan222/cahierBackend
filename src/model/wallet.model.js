import { Sequelize, DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";
import User from "./user.model.js";
const Wallet = sequelize.define("Wallet", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  balance: { type: DataTypes.INTEGER, defaultValue: 0 },

  accountType: {
    type: DataTypes.STRING,
    defaultValue: "wallet",
    validate: { isIn: [["wallet", "sbi", "hdfc", "city bank", "paytm"]] },
    usersList: {
      type: DataTypes.INTEGER,
      references: {
        Model: User,
        key: "id",
      },
    },
  },
});

export default Wallet;
