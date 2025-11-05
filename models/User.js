// DEPRECATED: This User model is legacy/unused in current codebase.
// Use models/Customer.js and models/Admin.js instead.
const mongoose = require('mongoose');

// Define user schema (both customers and admins will use this)
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, "Phone number must be 10 digits"]
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
