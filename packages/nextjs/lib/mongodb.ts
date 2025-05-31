import mongoose from "mongoose";

let isConnected:boolean=false;

export const connectToDB=async()=>{
    mongoose.set('strictQuery',true);
    const mongoDB=String(process.env.MONGODB_URI);
    console.log(mongoDB);    
    if(!mongoDB)
    {
        return console.log("the mongoDb uri is not defined");
    }
    if(isConnected)
    {
        console.log("using exisiting connection");
    }
    try{
        await mongoose.connect(mongoDB);
        isConnected=true;
        console.log("MongoDB connected");
    }
    catch(err)
    {
        console.log(err); 
    }
}
