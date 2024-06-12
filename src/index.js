import connect from './db/index.js';
import dotenv from "dotenv"
import app from './App.js';
dotenv.config(
    {   
        path: './env'
    }
)
let PORT = process.env.PORT || 8000;
connect()

    .then(() => {
        app.listen(PORT,() => {
            console.log("Server is running on PORT http://localhost:",PORT);
        });
    })
    .catch((err) => {
        console.log("Database connsction error", err);
    });