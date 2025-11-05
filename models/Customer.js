// models/Customer.js

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/,
    },
    password: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Customer', customerSchema);
