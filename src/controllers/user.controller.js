import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../model/index.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


let registerUser = asyncHandler(async (req, res) => {

    let { name, email, password } = req.body;
    
  
      
  

})

export  {registerUser}

