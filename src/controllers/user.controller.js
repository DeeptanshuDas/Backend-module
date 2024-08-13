import {  asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplaodOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  
    //get the user details from the request body
    const{fullName, email,username,password} =reg.body;
    console.log("email",email);
    if([fullName,email,username,password].some((field) => field ?.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }
    User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
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

export {registerUser}