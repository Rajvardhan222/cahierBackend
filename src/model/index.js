import { Sequelize } from "sequelize";
import { sequelize } from "../db/index.js";
import User from "./user.model.js";
import Transaction from "./transaction.model.js";
import Wallet from "./wallet.model.js";

User.hasMany(Wallet, { foreignKey: 'user' });
Wallet.belongsTo(User, { foreignKey: 'user' });

Wallet.hasMany(Transaction, { foreignKey: 'associatedWallet' });
Transaction.belongsTo(Wallet, { foreignKey: 'associatedWallet' });
sequelize.sync({ force: true }).then(() => {
    console.log('Database & tables created!');
  });
export { User , Transaction,Wallet};