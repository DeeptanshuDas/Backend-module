import {  asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uplaodOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessAndRefreshToken = async(userId) => {
  try {
     const user =await User.findById(userId)
     const accessToken =user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()

     user.refreshToken = refreshToken
     await user.save({validateBeforeSave:false})
     return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Something Went Wrong")
  }
}
const registerUser = asyncHandler(async (req, res) => {
  
    //get the user details from the request body
    const{fullName, email,username,password} =reg.body;
    console.log("email",email);
    if([fullName,email,username,password].some((field) => field?.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }
    const  existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) 
       && req.files.coverImage.length > 0){
       coverImageLocalPath = req.files.coverImage[0].path; 
      }
  
  
    if(!avatarLocalPath ){
        throw new ApiError(400,"Avatar is required")    
  }
  const avatar= await uplaodOnCloudinary(avatarLocalPath)
  const coverImage = await uplaodOnCloudinary(coverImageLocalPath)  
 if (!avatar){
    throw new ApiError(400,"Avatar upload failed");
    
 }
  const user= await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
 })
const createdUser = await User.findById(user._id).select("-password -refreshToken")
 if(!createdUser){
    throw new ApiError(500,"User registration failed")
 }
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully") 
  )
})
const loginUser =asyncHandler(async (req,res)=>{
  //req body -> data
  //username or email
  //find the user
  //pssword match
  //acess and refresh token
  //send cookies
  const {email,username,password} = req.body;
  
  if (!email || !username){
    throw new ApiError(400,"Email or username is required")
  }
   const user= await User.findOne({
  $or:[{email},{username}]
  })
  if(!user){
    throw new ApiError(404,"User not found")
  }

  const isPasswordVaild=await user.isPasswordCorrect(password)
  if(!isPasswordVaild){
    throw new ApiError(400,"Password is incorrect")
  }
  const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
   
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  const options={
    httpOnly:true,
    secure:true
  }
  return res.status(200).cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200,{
    user:loggedInUser,
    accessToken,
    refreshToken
  },"User logged in successfully"))

})
const logoutUser =asyncHandler(async(req,res)=>{
  User.findByIdAndUpdate(req.user._id,{
   $set:{ refreshToken:undefined}
  },{new:true})
 const options={
   httpOnly:true,
   secure:true
 } 
 return res.status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new ApiResponse(200,{},"User logged out successfully"))
})
const refreshAccessToken= asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken ||req.body.refreshToken
  if (!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized")
  }
 try {
   const decodedToken =jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
   const user = await User.findById(decodedToken?._id)
   if(!user){
     throw new ApiError(401,"Invalid refresh token") }
    if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401," refresh token is expired")}
   const options ={
     httpOnly:true,
     secure:true
   }
     const {accessToken,newrefreshToken}= await generateAccessAndRefreshToken(user._id)
     return res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newrefreshToken,options)
     .json(new ApiResponse(200,{
       accessToken,
       refreshToken:newrefreshToken
     },"Access token refreshed successfully"))
 } catch (error) {
  throw new ApiError(401,error?.message ||"Unauthorized")
 }
  })
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}