const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.MONGO_URI).then(console.log("Connected to MongoDB"))
  } catch (err) {
    console.log("Failed to connect to MongoDB", err);
    process.exit();
  }
};

module.exports = connectDB;