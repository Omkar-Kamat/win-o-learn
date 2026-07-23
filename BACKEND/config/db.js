/**
 * File: db.js
 * Description: Implementation of db.js
 */
import mongoose from 'mongoose';

// Performs the connect d b operation
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};


export default connectDB;
