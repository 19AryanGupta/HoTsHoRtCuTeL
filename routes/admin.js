// routes/admin.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');

// GET /api/admin/rooms  -> list rooms for admin
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    console.error('Admin list rooms error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/rooms -> create room (expects payload matching model)
router.post('/rooms', async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight, isAvailable } = req.body;
    // Basic validation
    if (!roomNumber || !roomType || pricePerNight === undefined) {
      return res.status(400).json({ message: 'roomNumber, roomType and pricePerNight are required' });
    }

    // Optionally check unique roomNumber
    const exists = await Room.findOne({ roomNumber });
    if (exists) return res.status(400).json({ message: 'roomNumber already exists' });

    const room = new Room({
      roomNumber: String(roomNumber),
      roomType,
      pricePerNight: Number(pricePerNight),
      isAvailable: !!isAvailable
    });

    await room.save();
    res.json({ message: 'Room added successfully', room });
  } catch (err) {
    console.error('Room addition error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/rooms/:id -> delete room
router.delete('/rooms/:id', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error('Room delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/bookings -> all bookings (mapped to frontend-friendly fields)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('room').populate('customer').sort({ createdAt: -1 });

    const mapped = bookings.map(b => ({
      _id: b._id,
      customerName: b.customer?.name || b.customer?.fullName || '',
      room: {
        _id: b.room?._id,
        type: b.room?.roomType || b.room?.type || '',
        roomNumber: b.room?.roomNumber || ''
      },
      dateFrom: b.checkInDate,
      dateTo: b.checkOutDate,
      totalAmount: b.totalAmount,
      status: b.status
    }));

    res.json(mapped);
  } catch (err) {
    console.error('Admin list bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/bookings/:id -> cancel booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // mark booking cancelled
    booking.status = 'Cancelled';
    await booking.save();

    // mark room available again
    await Room.findByIdAndUpdate(booking.room, { isAvailable: true });

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Booking cancel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/bookings/:id/remove -> permanently delete booking and related invoices
router.delete('/bookings/:id/remove', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Make room available again (defensive)
    try {
      await Room.findByIdAndUpdate(booking.room, { isAvailable: true });
    } catch (e) {
      // ignore room update errors but log
      console.error('Error marking room available during remove:', e);
    }

    // Remove invoice documents associated with this booking (if any)
    await Invoice.deleteMany({ booking: booking._id });

    // Remove the booking itself
    await Booking.findByIdAndDelete(booking._id);

    res.json({ message: 'Booking removed permanently' });
  } catch (err) {
    console.error('Booking remove error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/invoices -> list invoices (populate booking.customer and booking.room, return flattened data)
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().populate({
      path: 'booking',
      populate: [{ path: 'customer' }, { path: 'room' }]
    }).sort({ createdAt: -1 });

    const mapped = invoices.map(inv => ({
      _id: inv._id,
      bookingId: inv.booking?._id,
      customer: {
        _id: inv.booking?.customer?._id,
        name: inv.booking?.customer?.name || inv.booking?.customer?.fullName || '',
        email: inv.booking?.customer?.email || ''
      },
      room: {
        _id: inv.booking?.room?._id,
        type: inv.booking?.room?.roomType || inv.booking?.room?.type || '',
        roomNumber: inv.booking?.room?.roomNumber || ''
      },
      totalAmount: inv.amountPaid,
      createdAt: inv.createdAt
    }));

    res.json(mapped);
  } catch (err) {
    console.error('Admin invoices error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/invoices/:id -> detailed invoice for admin
router.get('/invoices/:id', async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).populate({
      path: 'booking',
      populate: [{ path: 'customer' }, { path: 'room' }]
    });

    if (!inv) return res.status(404).json({ message: 'Invoice not found' });

    const detailed = {
      invoiceId: inv._id,
      invoiceDate: inv.invoiceDate || inv.createdAt,
      amountPaid: inv.amountPaid,
      booking: {
        id: inv.booking?._id,
        checkInDate: inv.booking?.checkInDate,
        checkOutDate: inv.booking?.checkOutDate,
        totalAmount: inv.booking?.totalAmount,
        status: inv.booking?.status
      },
      customer: {
        id: inv.booking?.customer?._id,
        name: inv.booking?.customer?.name || inv.booking?.customer?.fullName || '',
        email: inv.booking?.customer?.email || '',
        phone: inv.booking?.customer?.phone || ''
      },
      room: {
        id: inv.booking?.room?._id,
        type: inv.booking?.room?.roomType || inv.booking?.room?.type || '',
        roomNumber: inv.booking?.room?.roomNumber || '',
        pricePerNight: inv.booking?.room?.pricePerNight
      }
    };

    res.json(detailed);
  } catch (err) {
    console.error('Admin invoice detail error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
