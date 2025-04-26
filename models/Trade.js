const mongoose = require('mongoose');

// Define a schema for the "Trade" collection
const tradeSchema = new mongoose.Schema({
    trade_id: {
        type: String,
        unique: true,
        required: true,
    },
    stock_name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    broker_name: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create a model based on the schema
const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
