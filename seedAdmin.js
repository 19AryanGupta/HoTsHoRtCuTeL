// seedAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const adminExists = await Admin.findOne({ username: "admin" });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("admin123", 10);

            const newAdmin = new Admin({
                username: "admin",
                password: hashedPassword,
            });

            await newAdmin.save();
            console.log("✅ Admin user created: admin / admin123");
        } else {
            console.log("⚠️ Admin user already exists");
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error creating admin:", error);
        process.exit(1);
    }
};

seedAdmin();
