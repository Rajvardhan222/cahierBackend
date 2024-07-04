import { where } from "sequelize";
import User from "../model/user.model.js";
import Wallet from "../model/wallet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/AsyncHandler.js";
import Transaction from "../model/transaction.model.js";

let createwallet = asyncHandler(async (req,res)=>{
        let {name,balance,type,userId} = req?.body
       
        if(!(name && balance )){
            throw new ApiError(500,'name,balance and type is required')
        }

        let wallet = await Wallet.create({name:name,balance:balance,accountType : type,userId:userId})

        let transaction = await Transaction.create({
            amount: parseInt(balance),
            category: "Start",
            description:  "Initial Balance",
            associatedWallet: wallet?.id,
        
            type: "I",
          });
        res.json(new ApiResponse(200,wallet,'wallet created'))
})

let getUserWallet = asyncHandler(async(req,res)=>{
            let walletId = req?.body?.userId
            let wallet = await Wallet.findOne({where:{id:walletId},include:User})

            res.status(200).json(
                new ApiResponse(200,wallet,'wallet created')
            )
})

let getWalletById = asyncHandler(async(req,res)=>{

    let userId = req?.body?.userId

   let myWallet =await  Wallet.findAll({where:{userId:userId}})

    if(!myWallet){
        throw new ApiError(404, 'No wallet found with specified id')
    }

    res.status(200).json(
        new ApiResponse(200,myWallet,'wallet found')
    )
})

let updateWalletAdd = asyncHandler(async(req,res)=>{
        let {money,walletId} = req?.body
let user = req?.user
        if(money <=0){
            throw new ApiError(500,'money should be greater than 0')
        }

       let wallet =await Wallet.findOne({where : {id : walletId}})

       if(!wallet){
        throw new ApiError(404,'No wallet found with specified id')
       }

       if(!(wallet.userId == user.id)){
        throw new ApiError(404,'You are not authorized to update this wallet')
       }

       wallet.balance += parseInt( money)
    let updatedWallet = await  wallet.save()

    res.status(200).json(
        new ApiResponse(200,updatedWallet,'wallet updated')
    )




})

let updateWalletLess = asyncHandler(async(req,res)=>{
    let {money,walletId} = req?.body
let user = req?.user
   

   let wallet =await Wallet.findOne({where : {id : walletId}})

   if(!wallet){
    throw new ApiError(404,'No wallet found with specified id')
   }

   if(!(wallet.userId == user.id)){
    throw new ApiError(404,'You are not authorized to update this wallet')
   }

   wallet.balance -= parseInt( money)

   if(wallet.balance < 0){
    throw new ApiError(500,'Insufficient balance')
   }
let updatedWallet = await  wallet.save()

res.status(200).json(
    new ApiResponse(200,updatedWallet,'wallet updated')
)




})

export { createwallet,getUserWallet,getWalletById,updateWalletAdd,updateWalletLess}