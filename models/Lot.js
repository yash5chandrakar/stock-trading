const mongoose = require('mongoose');

// Define a schema for the "Lot" collection
const lotSchema = new mongoose.Schema({
    lot_id: {
        type: String,
        unique: true,
        required: true,
    },
    trade_id: {
        type: String,
        required: true
    },
    stock_name: {
        type: String,
        required: true
    },
    lot_quantity: {
        type: Number,
        required: true
    },
    realized_quantity: {
        type: Number,
        default: 0
    },
    realized_trade_id: {
        type: String,
        default: null
    },
    lot_status: {
        type: String,
        enum: ['OPEN', 'PARTIALLY REALIZED', 'FULLY REALIZED'],
        default: 'OPEN'
    },
}, {
    timestamps: true
});

// Create a model based on the schema
const Lot = mongoose.model('Lot', lotSchema);

module.exports = Lot;
