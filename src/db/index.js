import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  `postgres://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.HPORT}/cashier`
);
let connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export {sequelize}
export default connect;
