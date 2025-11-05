// routes/invoices.js

const express = require('express');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const router = express.Router();

// Invoice(s) for a customer
router.get('/customer/:customerId', async (req, res) => {
    const { customerId } = req.params;
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const bookings = await Booking.find({ customer: customerId }).populate('room');
        const invoiceData = {
            customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
            bookings: bookings.map((b) => ({
                bookingId: b._id,
                roomType: b.room?.roomType || '',
                roomNumber: b.room?.roomNumber || '',
                pricePerNight: b.room?.pricePerNight || b.totalAmount || 0,
                checkIn: b.checkInDate,
                checkOut: b.checkOutDate,
                totalAmount: b.totalAmount,
                status: b.status
            })),
        };

        res.json(invoiceData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get invoice by booking id (used by invoice.html)
router.get('/:bookingId', async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findById(bookingId).populate('room').populate('customer');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const invoiceData = {
            customer: {
                name: booking.customer?.name || booking.customer?.fullName || '',
                email: booking.customer?.email || '',
                phone: booking.customer?.phone || ''
            },
            room: {
                type: booking.room?.roomType || '',
                roomNumber: booking.room?.roomNumber || '',
                pricePerNight: booking.room?.pricePerNight || booking.totalAmount || 0
            },
            checkIn: booking.checkInDate,
            checkOut: booking.checkOutDate,
            totalPrice: booking.totalAmount,
            status: booking.status
        };

        res.json(invoiceData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
