const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error("❌ Database connection failed: MONGO_URI is not defined in .env file");
      console.error("Please set MONGO_URI in your .env file");
      process.exit(1);
    }

    // Validate connection string format
    const uri = process.env.MONGO_URI.trim();
    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      console.error("❌ Database connection failed: Invalid MongoDB connection string format");
      console.error("Connection string should start with 'mongodb://' or 'mongodb+srv://'");
      process.exit(1);
    }

    // Attempt connection with options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(uri, options);
    console.log("✅ MongoDB connected successfully");
    
    // Log database name
    const dbName = mongoose.connection.db?.databaseName || "unknown";
    console.log(`📦 Database: ${dbName}`);
  } catch (error) {
    console.error("❌ Database connection failed");
    
    // Provide more specific error messages
    if (error.code === 'ENOTFOUND') {
      console.error("⚠️  DNS lookup failed - The MongoDB hostname cannot be resolved");
      console.error("   This usually means:");
      console.error("   1. The MongoDB connection string is incorrect");
      console.error("   2. The MongoDB cluster doesn't exist or has been deleted");
      console.error("   3. There's a network connectivity issue");
      console.error(`   Hostname attempted: ${error.hostname || 'unknown'}`);
    } else if (error.code === 'ETIMEDOUT') {
      console.error("⚠️  Connection timeout - Unable to reach MongoDB server");
      console.error("   Check your internet connection and firewall settings");
    } else if (error.message?.includes('authentication')) {
      console.error("⚠️  Authentication failed - Check your username and password in MONGO_URI");
    } else {
      console.error("   Error details:", error.message);
    }
    
    console.error("\n💡 Tip: Check your .env file and ensure MONGO_URI is correct");
    console.error("   Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority");
    
    process.exit(1);
  }
};

module.exports = connectDB;
