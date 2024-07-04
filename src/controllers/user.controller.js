import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import crypto from "crypto";
import { User } from "../model/index.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { client } from "../db/redis.js";
import Mailjet from "node-mailjet";
import cookieParser from "cookie-parser";
import { uploadOnCloudinary } from "../middlewares/cloudinary.middleware.js";
import jwt from "jsonwebtoken";
import jdenticon from "jdenticon/standalone";
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

let sendOtp = async (otp, email, name) => {
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "rajvardhanranawat80@gmail.com",
          Name: "Cashier",
        },
        To: [
          {
            Email: `${email}`,
            Name: `${name}`,
          },
        ],
        Subject: "Verify your Email Cashier",
        TextPart: `Dear ${name} this is your OTP for creating your account with cashier ${otp}`,
        HTMLPart: `
              <html>
                <head>
                  <style>
                    .email-container {
                      font-family: Arial, sans-serif;
                      padding: 20px;
                      background-color: #f9f9f9;
                      border: 1px solid #ddd;
                      max-width: 600px;
                      margin: 0 auto;
                    }
                    .email-content {
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 5px;
                    }
                    .email-footer {
                      text-align: center;
                      color: #777;
                      font-size: 12px;
                      margin-top: 20px;
                    }
                  </style>
                </head>
                <body>
                  <div class="email-container">
                    <div class="email-content">
                      <h2>Dear ${name},</h2>
                      <p>This is your OTP for creating your account with Cahier:</p>
                      <h1>${otp}</h1>
                      <p>Please use this OTP to complete your registration.</p>
                      <p>Thank you for choosing Cahier!</p>
                    </div>
                    <div class="email-footer">
                      <p>If you did not request this OTP, please ignore this email.</p>
                      <p>&copy; 2024 Cahier. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
      },
    ],
  });

  request
    .then((result) => {
      console.log(result.body);
    })
    .catch((err) => {
      console.log(202, `Unable to send otp ${err.message}`);
    });
};
let registerUser = asyncHandler(async (req, res) => {
  let { name, email, password, currency } = req.body;
  if (!(name && email && password)) {
    throw new ApiError(500, "name email is required");
  }
  let isUserThere = await User.findOne({ where: { email: email } });
  if (isUserThere) {
    throw new ApiError(
      500,
      "User is already registered try with a different email"
    );
  }

  let otp = crypto.randomInt(1000, 9999).toString();
  // let user = await User.create({name: name, email: email, password: password})
  await client.setEx(`otp:${email}`, 600, otp);
  await client.setEx(
    `${otp}`,
    600,
    JSON.stringify({ name: name, email: email, password: password })
  );

  await sendOtp(otp, email, name);
  res.json(new ApiResponse(200, {}, "Otp send success"));
});

let verifyOtp = asyncHandler(async (req, res) => {
  let { otp } = req.body;
  if (!otp) {
    throw new ApiError(500, "email and otp is required");
  }
  let userDetail = await client.get(otp);
  let userInfo = JSON.parse(userDetail);
  let otpFromRedis = await client.get(`otp:${userInfo.email}`);
  console.log(userInfo);
  if (otpFromRedis != otp) {
    throw new ApiError(500, "Invalid OTP");
  }

  let initials = userInfo.name;

  let avtr = jdenticon.toSvg(initials, 200);
  let date = Date.now();
  let profileImage = fs.writeFileSync(`./public/temp/avatar-${date}.svg`, avtr);

  let avatar = await uploadOnCloudinary(`./public/temp/avatar-${date}.svg`);

  if (!avatar) {
    throw new ApiError(500, "Failed to generate Avatar");
  }

  let isUserThere = await User.findOne({ where: { email: userInfo.email } });
  if (isUserThere) {
    throw new ApiError(
      500,
      "User is already registered try with a different email"
    );
  }

  console.log({
    name: userInfo.name,
    email: userInfo.email,
    password: userInfo.password,
    avatar: avatar.url,
  });
  let user = await User.create({
    name: userInfo.name,
    email: userInfo.email,
    password: userInfo.password,
    avatar: avatar.url,
  });
  let userData = await User.findOne({
    where : {id : user.id},
    include : [{ all: true }],
    attributes: { exclude: ["password"] },
  })
  res.json(new ApiResponse(200, {userData}, "Otp verify success"));
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    let user = await User.findOne({ where: { email: userId } });

    console.log("user 136", user);

    if (!user) {
      throw new ApiError(500, "User not found");
    }

    let accessToken = await user.generateAccessToken();
    let refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(502, `Failed to generate refreshToken ${error}`);
  }
};

let loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  if (!(email && password)) {
    throw new ApiError(500, "email and password is required");
  }
  let user = await User.findOne({ where: { email: email } });

  if (!user) {
    throw new ApiError(500, "User is not registered please register");
  }

  let isPasswordCorrect = await user.verifyPassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(500, "Invalid email or password");
  }
  let { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    email
  );
  let userInfo = await User.findOne({
    where: { email: email },
    attributes: { exclude: ["password"] },
    include : [{all : true}]
  });
  const option = {
    httpOnly: true,
    secure: false,
    // sameSite: 'none', 
   
  };



  res
    .status(201)
    .cookie("refreshToken", refreshToken, option)
    .cookie("accessToken", accessToken, option)
    .json(new ApiResponse(200, { login: true, userInfo }, "Login success"));
});

let regenerateAccessToken = asyncHandler(async (req, res) => {
  let refreshTokenUser = req?.cookies?.refreshToken;
  console.log(req);

  let user = jwt.verify(refreshTokenUser, process.env.REFRESH_TOKEN_SECRET);

  let dbUser = await User.findByPk(user.id);

  if (!dbUser) {
    throw new ApiError(404, "User not found");
  }

  let { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    dbUser.email
  );
  const option = {
    httpOnly: true,
    secure: true,
  };
let data= await User.findOne({
  where : {email: dbUser.email},
  attributes: { exclude: ["password"] },
})
  res
    .status(201)
    .cookie("refreshToken", refreshToken, option)
    .cookie("accessToken", accessToken, option)
    .json(new ApiResponse(200, {data}, "Access token refreshed successfully"));
});

let verifyAccessToken = asyncHandler(async (req, res) => {
  let user = req.user;
  console.log("user detail  ",user);

  res.status(255).json(new ApiResponse(255, user, "User is valid "));
});

const logOut = asyncHandler(async (req, res) => {
  let user = req.user;
  let clearAccessToken = await User.findByPk(user.id)
  clearAccessToken.accessToken = null;
  await clearAccessToken.save();

  const option = {
   
};

res.status(201)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "logged Out successful"));


})
export {
  registerUser,
  verifyOtp,
  loginUser,
  regenerateAccessToken,
  verifyAccessToken,
  logOut
};
