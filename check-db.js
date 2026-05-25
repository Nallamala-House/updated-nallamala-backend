const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://Web-Admin:9HPkAFXKZGyZTzvD@nallamala-website.yivwpw2.mongodb.net/nallamala_db";

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB!");
        
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();
        console.log("Users in DB:", users.map(u => ({ name: u.name, email: u.email, role: u.role })));
        
        const resourcesCount = await db.collection('resources').countDocuments();
        console.log("Resources count in DB:", resourcesCount);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

run();
