import { Sequelize } from "sequelize";
import pkg from 'pg';
const { Client } = pkg;
const sequelize = new Sequelize(
  `postgres://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.HPORT}/cashier`,{
    logging: false
  }
);

let client = new Client({connectionString:process.env.CONNECTION_STRING})
let connect = async () => {
  try {
    await sequelize.authenticate();
    await client.connect();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export {sequelize}
export default connect;
