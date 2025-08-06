import mongoose from "mongoose";

const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.log("Error Occured", error);
    }
}

export default connectDb;