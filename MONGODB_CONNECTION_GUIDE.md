# MongoDB Connection String Fix Guide

## Problem
Your MongoDB connection string has an incorrect hostname: `mindease.ctmmw.mongodb.net`

## Solution
Update your `MONGO_URI` in the `.env` file with the correct MongoDB Atlas connection string.

## How to Get Your Correct MongoDB Atlas Connection String

### Step 1: Log into MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Log in to your account

### Step 2: Get Your Connection String
1. Click on **"Connect"** button for your cluster
2. Select **"Connect your application"**
3. Choose **"Node.js"** as your driver
4. Copy the connection string

### Step 3: Format Your Connection String
The correct format should be:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
```

### Example:
```
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/mindease?retryWrites=true&w=majority
```

## Important Notes:
- Replace `<username>` with your MongoDB Atlas username
- Replace `<password>` with your MongoDB Atlas password (URL-encode special characters)
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster hostname
- Replace `<database>` with your database name (e.g., `mindease`)

## Common Issues:
1. **Password with special characters**: Use URL encoding
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `/` becomes `%2F`
   - etc.

2. **Network Access**: Make sure your IP address is whitelisted in MongoDB Atlas
   - Go to Network Access in MongoDB Atlas
   - Add your current IP or use `0.0.0.0/0` for development (not recommended for production)

3. **Database User**: Make sure you have a database user created
   - Go to Database Access in MongoDB Atlas
   - Create a user if needed

## After Updating:
1. Save your `.env` file
2. Restart your server (nodemon should auto-restart)
3. You should see: `✅ MongoDB connected successfully`

