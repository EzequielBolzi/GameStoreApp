const mongoose = require('mongoose');


// Purchase Schema
const PurchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);

module.exports = Purchase;