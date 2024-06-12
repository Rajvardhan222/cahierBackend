import { Sequelize, DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";
import Wallet from "./wallet.model.js";
let Transaction = sequelize.define("Transaction",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      repeat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      frequency: DataTypes.DATE,
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 0 }
      },
      category: DataTypes.STRING,
      description: DataTypes.STRING,
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      associatedWallet: {
        type: DataTypes.INTEGER,
        references: {
          model: Wallet,
          key: 'id'
        },
        allowNull: false
      }
})

export default Transaction