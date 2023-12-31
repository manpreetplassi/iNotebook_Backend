const mongoose = require('mongoose');
require('dotenv').config(); 
let mongoURI = process.env.MONGO_URI
// const mongoURI = "mongodb://0.0.0.0:27017/inotebook"

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
    }
}

module.exports = connectToMongo;
