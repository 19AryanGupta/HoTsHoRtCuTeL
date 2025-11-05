// routes/rooms.js

const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

function capacityBasedOnType(roomType) {
    switch (roomType) {
        case 'Single': return 1;
        case 'Double': return 2;
        case 'Suite': return 4;
        case 'Deluxe': return 3;
        default: return 2;
    }
}

// ✅ Customer: Get only available rooms (mapped for frontend)
router.get('/', async (req, res) => {
    try {
        const availableRooms = await Room.find({ isAvailable: true }).sort({ roomNumber: 1 });
        const mapped = availableRooms.map(r => ({
            _id: r._id,
            roomNumber: r.roomNumber,
            type: r.roomType,
            price: r.pricePerNight,
            capacity: capacityBasedOnType(r.roomType),
            isAvailable: r.isAvailable
        }));
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single room by id (mapped)
router.get('/:id', async (req, res) => {
    try {
        const r = await Room.findById(req.params.id);
        if (!r) return res.status(404).json({ message: 'Room not found' });
        res.json({
            _id: r._id,
            roomNumber: r.roomNumber,
            type: r.roomType,
            price: r.pricePerNight,
            capacity: capacityBasedOnType(r.roomType),
            isAvailable: r.isAvailable
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Admin: Add new room
router.post('/', async (req, res) => {
    const { roomNumber, roomType, pricePerNight, isAvailable } = req.body;

    try {
        const newRoom = new Room({ roomNumber, roomType, pricePerNight, isAvailable });
        await newRoom.save();
        res.status(201).json({ message: "Room added successfully", room: newRoom });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
