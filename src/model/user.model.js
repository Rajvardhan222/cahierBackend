import { Sequelize,DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency : {
        type: DataTypes.STRING,
        
        defaultValue: 'INR',
        validate: {
            isIn: [['INR', 'USD', 'EUR', 'GBP', 'JPY']]
          }
    },
    refreshToken : {
        type: DataTypes.STRING,
        defaultValue: null,
       
    }
})

export default User