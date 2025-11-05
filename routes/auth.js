// routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const router = express.Router();

// Register Customer
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = new Customer({
            name,
            email,
            phone,
            password: hashedPassword,
        });

        await newCustomer.save();
        res.status(201).json({ message: "Customer registered successfully" });
    } catch (error) {
        console.error("Error in /register:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Customer Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, customer.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.json({ message: "Login successful", customerId: customer._id });
    } catch (error) {
        console.error("Error in /login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin Login (database-based)
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        res.json({ message: "Admin login successful", adminId: admin._id });
    } catch (error) {
        console.error("Error in /admin/login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
