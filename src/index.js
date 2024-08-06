import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";
import connectDB from "./db/index.js";
import { errorMessage } from "stream-chat-react/dist/components/AutoCompleteTextarea/utils.js";
dotenv.config({
    path: "./env"
})



connectDB()
.then(() =>{
    app.listen(process.env.PORT|| 8000,() =>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err) =>{
    console.log("MONGO db connection FAILED !!! ", err);
})
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