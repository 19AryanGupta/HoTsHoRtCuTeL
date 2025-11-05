// models/Room.js
const mongoose = require('mongoose');

// Define room schema
const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['Single', 'Double', 'Suite', 'Deluxe']
    },
    pricePerNight: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
