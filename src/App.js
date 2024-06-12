import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin : "*"
    }));
    
    app.use(express.json({limit : "20kb"}))
    app.use(express.static("public"));   
import UserRoute from './routes/user.routes.js';
app.use("/api/v1/users", UserRoute);

export default app