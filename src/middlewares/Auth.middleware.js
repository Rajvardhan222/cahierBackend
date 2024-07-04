import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import User from "../model/user.model.js";
import  jwt  from "jsonwebtoken";
export let varifyJWT = asyncHandler(async (req,_,next)=>{
   try {
   console.log(req);
     let token = req?.cookies.accessToken;
 
     if (!token) {
         throw new ApiError(400,'Invalid Access')
     }
 
   const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   console.log("decodedToken",decodedToken);
   let user =await User.findByPk(decodedToken.id,{ attributes: { exclude: ['password'] }})
   if (!user) {
     throw new ApiError(450,"Invalid User")
   }
   console.log('logout',user);
   req.user = user;
   next()
   } catch (error) {
    throw new ApiError(500,'This user does not have valid access Token')
   }

})

