// models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    amountPaid: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
