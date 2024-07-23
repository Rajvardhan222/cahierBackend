import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './utils/errorHandler.js';

const app = express();



app.use(cors(
    {
        origin :'http://localhost:5173',
        credentials : true,
         methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
        
    }
));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
    
    app.use(express.json({limit : "20kb"}))
    app.use(express.static("public"));  

    
       
    
import UserRoute from './routes/user.routes.js';
import walletRoute from './routes/wallet.routes.js';
import transactionRoute from './routes/transaction.routes.js';

app.use("/api/v1/users", UserRoute);
app.use("/api/v1/wallet", walletRoute);
app.use("/api/v1/transaction", transactionRoute);
app.use(errorHandler);
export default app