import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGODB_URL as string);
        console.log("successfully connected mongodb");
    }
    catch (error) {
        console.log("failed to connect mongodb", error);
        process.exit(1);
    }

}

export default connectDB;