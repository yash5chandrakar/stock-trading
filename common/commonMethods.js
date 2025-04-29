const Lot = require("../models/Lot");
const Trade = require("../models/Trade");
const { validateTradeInput } = require("../validators/tradeValidators");
const { v4: uuidv4 } = require('uuid');

// for JSON Formatting
const formatToJSON = (response) => {
    return JSON.parse(JSON.stringify(response));
}

// For Buy Trades
const saveBuyTrade = async (tradeItem) => {
    try {
        const { isValid, errors } = validateTradeInput(tradeItem, 'buy');
        if (!isValid) {
            return {
                status: false,
                message: "Validation Failed",
                errors: errors
            };
        }

        const { stock_name, quantity, broker_name, price } = tradeItem;
        const amount = quantity * price;

        const trade = new Trade({
            trade_id: uuidv4(),
            stock_name,
            quantity,
            broker_name,
            price,
            amount,
            type: "BUY"
        });

        await trade.save();

        const lotData = new Lot({
            lot_id: uuidv4(),
            trade_id: trade?.trade_id,
            lot_quantity: quantity,
            realized_quantity: 0,
            realized_trade_id: null,
            lot_status: "OPEN",
            stock_name: stock_name
        })

        await lotData.save()

        return {
            status: true,
            message: "Trade Added Successfully."
        }
    }
    catch (err) {
        let errMsg = err?.message || ""
        return {
            status: false,
            message: errMsg || "Something Went Wrong"
        }
    }
}

// For Sell Trades
const saveSellTrade = async (tradeItem) => {
    try {
        const { stock_name, quantity, price } = tradeItem;
        let remainingQuantity = quantity;

        const amount = quantity * price;

        const { isValid, errors } = validateTradeInput(tradeItem, 'sell');
        if (!isValid) {
            return {
                status: false,
                message: "Validation Failed",
                errors: errors
            };
        }

        const trade = new Trade({
            trade_id: uuidv4(),
            stock_name,
            quantity: quantity,
            price,
            amount,
            type: "SELL"
        });

        await trade.save();

        let lots;

        if (tradeItem?.sellType === "FIFO") {
            lots = await Lot.find({
                stock_name: stock_name,
                lot_status: { $in: ['OPEN', 'PARTIALLY REALIZED'] }
            }).sort({ createdAt: 1 });
        }
        else {
            lots = await Lot.find({
                stock_name: stock_name,
                lot_status: { $in: ['OPEN', 'PARTIALLY REALIZED'] }
            }).sort({ createdAt: -1 });
        }

        if (!lots.length) {
            await Trade.deleteOne({ _id: trade._id });
            return {
                status: false,
                message: 'No available lots to realize for this stock.'
            };
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

            await Lot.updateOne(
                { _id: lot._id }, // Filter
                {
                    $set: {
                        realized_quantity: lot.realized_quantity,
                        lot_status: lot.lot_status,
                        realized_trade_id: lot.realized_trade_id
                    }
                }
            );
            lotsToUpdate.push({
                ...lot,
                _id: lot?._id,
                original_realized_quantity,
                original_lot_status,
                original_realized_trade_id,
            });

            remainingQuantity -= qtyToRealize;
        }

        if (remainingQuantity > 0) {
            for (const lot of lotsToUpdate) {
                await Lot.updateOne(
                    { _id: lot._id }, // Filter
                    {
                        $set: {
                            realized_quantity: lot.realized_quantity,
                            lot_status: lot.lot_status,
                            realized_trade_id: lot.realized_trade_id
                        }
                    }
                );
                lotsToUpdate.push({
                    ...lot,
                    _id: lot?._id,
                    original_realized_quantity,
                    original_lot_status,
                    original_realized_trade_id,
                });
            }

            await Trade.deleteOne({ _id: trade._id });

            return {
                status: false,
                message: 'Not enough shares in available lots to complete this sell.'
            };
        }

        return {
            status: true,
            message: 'Sell executed using FIFO.',
            realized_quantity: quantity
        };
    }
    catch (err) {
        let errMsg = err?.message || ""
        return {
            status: false,
            message: errMsg || "Something Went Wrong"
        }
    }
}

exports.formatToJSON = formatToJSON
exports.saveBuyTrade = saveBuyTrade
exports.saveSellTrade = saveSellTrade