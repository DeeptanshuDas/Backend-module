import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";
import connectDB from "./db/index.js";
dotenv.config({
    path: "./env"
})



connectDB()
/*
(async () => {
    try {
        await mongoose.connect('${process.env.MONGODB_URI}/${DB_NAME}' )
        application.on("error", (error) => {
            console.log("Error: ", error);
            throw error});
        application.listen(process.env.PORT, () => {
            console.log('App is listening on port ${process.env.PORT}');
        });
        } catch (error) {
       console.error("Error: ", error);
       throw error;
    }
})()
mongoose.connect*/