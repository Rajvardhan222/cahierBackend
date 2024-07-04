import connect from './db/index.js';
import dotenv from "dotenv"
import app from './App.js';
import connectRedis from './db/redis.js';
import graphileWorker from './db/graphile.worker.js';
dotenv.config(
    {   
        path: './env'
    }
)

let PORT = process.env.PORT || 8000;
connect()
graphileWorker()
    .then(() => {
        app.listen(PORT,() => {
            connectRedis().catch(() => {console.log('redis connection failed');})
            console.log("Server is running on PORT http://localhost:",PORT);
        });
    })
    .catch((err) => {
        console.log("Database connsction error", err);
    });