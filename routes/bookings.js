// routes/bookings.js

const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Customer = require('../models/Customer'); // <-- added
const router = express.Router();

// Create a booking
router.post('/', async (req, res) => {
    const { customerId, roomId, checkIn, checkOut } = req.body;

    try {
        if (!customerId || !roomId || !checkIn || !checkOut) {
            return res.status(400).json({ message: "Missing booking data" });
        }

        // Validate customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(400).json({ message: "Invalid customer. Please log in." });
        }

        // Validate room
        const room = await Room.findById(roomId);
        if (!room || !room.isAvailable) {
            return res.status(400).json({ message: "Room not available" });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
            return res.status(400).json({ message: "Invalid dates" });
        }

        // compute nights
        const msPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.ceil((checkOutDate - checkInDate) / msPerDay);

        const totalAmount = nights * room.pricePerNight;

        const booking = new Booking({
            customer: customerId,
            room: roomId,
            checkInDate,
            checkOutDate,
            totalAmount
        });

        await booking.save();

        // Update room availability
        room.isAvailable = false;
        await room.save();

        res.status(201).json({ message: "Booking successful", booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bookings for a customer
router.get('/:customerId', async (req, res) => {
    const { customerId } = req.params;

    try {
        const bookings = await Booking.find({ customer: customerId }).populate('room').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
