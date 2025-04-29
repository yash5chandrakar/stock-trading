const { formatToJSON } = require("../common/commonMethods");
const Lot = require("../models/Lot");
const mongoose = require('mongoose');
const Trade = require("../models/Trade");
const { v4: uuidv4 } = require('uuid');
const { validateTradeInput } = require("../validators/tradeValidators");

// Fetch Lot
exports.getLot = async (req, res) => {
    try {
        const lot = await Lot.findOne({ lot_id: req.params.id });

        if (!lot) {
            return res.status(404).json({ error: 'Lot not found' });
        }

        return res.status(200).json({
            status: true,
            data: lot
        });
    }
    catch (err) {
        let errMsg = err?.message || "";
        return res.status(500).json({
            status: false,
            message: errMsg || "Something Went Wrong"
        });
    }
};

// Fetch All Lots
exports.getAllLots = async (req, res) => {
    try {
        const lots = await Lot.find();

        if (lots.length === 0) {
            return res.status(404).json({ error: 'No lots found' });
        }

        return res.status(200).json({
            status: true,
            data: lots
        });
    }
    catch (err) {
        let errMsg = err?.message || "";
        return res.status(500).json({
            status: false,
            message: errMsg || "Something Went Wrong"
        });
    }
};

// Sell from Lots using FIFO
exports.sellFromLotsFIFO = async (req, res) => {
    try {
        const { stock_name, sell_quantity, price } = req.body;
        let remainingQuantity = sell_quantity;

        const amount = sell_quantity * price;

        const trade = new Trade({
            trade_id: uuidv4(),
            stock_name,
            quantity: sell_quantity,
            price,
            amount,
            type: "SELL"
        });

        await trade.save();

        const lots = await Lot.find({
            stock_name: stock_name,
            lot_status: { $in: ['OPEN', 'PARTIALLY REALIZED'] }
        }).sort({ createdAt: 1 });

        if (!lots.length) {
            await Trade.deleteOne({ _id: trade._id });
            return res.status(404).json({
                status: false,
                message: 'No available lots to realize for this symbol.'
            });
        }

        let lotsToUpdate = [];

        for (const lot of lots) {
            if (remainingQuantity <= 0) break;

            const availableQty = lot.lot_quantity - lot.realized_quantity;
            const qtyToRealize = Math.min(availableQty, remainingQuantity);

            const original_realized_quantity = lot.realized_quantity
            const original_lot_status = lot.lot_status
            const original_realized_trade_id = lot.realized_trade_id

            lot.realized_quantity += qtyToRealize;

            // Update lot status
            if (lot.realized_quantity === lot.lot_quantity) {
                lot.lot_status = 'FULLY REALIZED';
                lot.realized_trade_id = trade.trade_id;
            } else {
                lot.lot_status = 'PARTIALLY REALIZED';
            }

            await lot.save();
            lotsToUpdate.push({
                ...lot,
                original_realized_quantity,
                original_lot_status,
                original_realized_trade_id,
            });

            remainingQuantity -= qtyToRealize;
        }

        if (remainingQuantity > 0) {
            for (const lot of lotsToUpdate) {
                lot.realized_quantity = lot.original_realized_quantity;
                lot.lot_status = lot.original_lot_status
                lot.realized_trade_id = lot.original_realized_trade_id;

                await lot.save();
            }

            await Trade.deleteOne({ _id: trade._id });

            return res.status(400).json({
                status: false,
                message: 'Not enough shares in available lots to complete this sell.'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Sell executed using FIFO.',
            realized_quantity: sell_quantity
        });
    }
    catch (err) {
        let errMsg = err?.message || "";
        return res.status(500).json({
            status: false,
            message: errMsg || "Something Went Wrong"
        });
    }
};


// Sell from Lots using LIFO
exports.sellFromLotsLIFO = async (req, res) => {
    try {
        const { stock_name, sell_quantity, price } = req.body;
        let remainingQuantity = sell_quantity;

        const amount = sell_quantity * price;

        const trade = new Trade({
            trade_id: uuidv4(),
            stock_name,
            quantity: sell_quantity,
            price,
            amount,
            type: "SELL"
        });

        await trade.save();

        const lots = await Lot.find({
            stock_name: stock_name,
            lot_status: { $in: ['OPEN', 'PARTIALLY REALIZED'] }
        }).sort({ createdAt: -1 });

        if (!lots.length) {
            await Trade.deleteOne({ _id: trade._id });
            return res.status(404).json({
                status: false,
                message: 'No available lots to realize for this symbol.'
            });
        }

        let lotsToUpdate = [];

        for (const lot of lots) {
            if (remainingQuantity <= 0) break;

            const availableQty = lot.lot_quantity - lot.realized_quantity;
            const qtyToRealize = Math.min(availableQty, remainingQuantity);

            const original_realized_quantity = lot.realized_quantity
            const original_lot_status = lot.lot_status
            const original_realized_trade_id = lot.realized_trade_id

            lot.realized_quantity += qtyToRealize;

            // Update lot status
            if (lot.realized_quantity === lot.lot_quantity) {
                lot.lot_status = 'FULLY REALIZED';
                lot.realized_trade_id = trade.trade_id;
            } else {
                lot.lot_status = 'PARTIALLY REALIZED';
            }

            await lot.save();
            lotsToUpdate.push({
                ...lot,
                original_realized_quantity,
                original_lot_status,
                original_realized_trade_id,
            });

            remainingQuantity -= qtyToRealize;
        }

        if (remainingQuantity > 0) {
            for (const lot of lotsToUpdate) {
                lot.realized_quantity = lot.original_realized_quantity;
                lot.lot_status = lot.original_lot_status
                lot.realized_trade_id = lot.original_realized_trade_id;

                await lot.save();
            }

            await Trade.deleteOne({ _id: trade._id });

            return res.status(400).json({
                status: false,
                message: 'Not enough shares in available lots to complete this sell.'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Sell executed using LIFO.',
            realized_quantity: sell_quantity
        });
    }
    catch (err) {
        let errMsg = err?.message || "";
        return res.status(500).json({
            status: false,
            message: errMsg || "Something Went Wrong"
        });
    }
};
