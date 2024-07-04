import { Sequelize,DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique:true,
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
       
    },
    avatar : {
        type: DataTypes.STRING,
        defaultValue: null,
    }
    
},{
    hooks : {
        beforeCreate :async (user) => {
              user.password = await bcrypt.hash(user.password, 10);  
        },
        
    }
},{
    
})
User.prototype.verifyPassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

User.prototype.generateAccessToken = function () {
   
    return jwt.sign(
        {
            id: this.id,
            email: this.email,
            name: this.name,
            
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

User.prototype.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};
export default User