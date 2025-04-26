const { saveBuyTrade, saveSellTrade } = require("../common/commonMethods");
const Lot = require("../models/Lot");
const Trade = require("../models/Trade");
const { validateTradeInput } = require("../validators/tradeValidators");
const { v4: uuidv4 } = require('uuid');

// Adding a Trade (BUY)
exports.addtrades = async (req, res) => {
    try {
        const { isValid, errors } = validateTradeInput(req?.body, 'buy');
        if (!isValid) {
            return res.status(422).json({ errors: errors });
        }

        const { stock_name, quantity, broker_name, price } = req.body;
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

        return res.status(201).json({
            status: true,
            message: "Trade Added Successfully."
        });
    } catch (err) {
        let errMsg = err?.message || ""
        return res.status(500).json({
            status: false,
            message: errMsg || "Something Went Wrong"
        });
    }
}

// Updating a Trade
exports.updateTrade = async (req, res) => {
    try {
        const { isValid, errors } = validateTradeInput(req?.body);
        if (!isValid) {
            return res.status(422).json({ errors: errors });
        }

        const { stock_name, quantity, broker_name, price, trade_id } = req.body;
        const amount = quantity * price;

        const updated = await Trade.findOneAndUpdate(
            { trade_id: trade_id },
            { stock_name, quantity, broker_name, price, amount },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Trade not found' });
        }

        return res.status(201).json({
            status: true,
            message: "Trade Updated Successfully."
        });
    }
    catch (err) {
        let errMsg = err?.message || ""
        return res.status(500).json({
            status: false,
            message: errMsg || "Something Went Wrong"
        });
    }
};

// Remove a Trade
exports.deleteTrade = async (req, res) => {
    try {
        const deleted = await Trade.findOneAndDelete({ trade_id: req.params.id });

        if (!deleted) {
            return res.status(404).json({ error: 'Trade not found' });
        }

        return res.status(200).json({
            status: true,
            message: "Trade Deleted Successfully."
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

// Fetch Trade
exports.getTrade = async (req, res) => {
    try {
        let trade_id = req?.body?.trade_id;
        if (!trade_id) {
            return res.status(404).json({ error: 'Invalid Trade ID' });
        }
        const trade = await Trade.findOne({ trade_id: trade_id });

        if (!trade) {
            return res.status(404).json({ error: 'Trade not found' });
        }

        return res.status(200).json({
            status: true,
            data: trade
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

// Fetch All Trades
exports.getAllTrades = async (req, res) => {
    try {
        const trades = await Trade.find();

        if (trades.length === 0) {
            return res.status(404).json({ error: 'No trades found' });
        }

        return res.status(200).json({
            status: true,
            data: trades
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

// Handle Bulk Trades
exports.bulkTrade = async (req, res) => {
    try {
        const tradeItems = req?.body?.tradeItems || [];

        if (!tradeItems.length) {
            return res.status(422).json({ status: false, message: "No Items Found!" });
        }

        let tradeResponses = []

        for (let item of tradeItems) {
            if (item?.type == "BUY") {
                let resp = await saveBuyTrade(item)
                if (!resp?.status) {
                    tradeResponses.push({
                        ...resp,
                        item
                    })
                }
            }
            else {
                let resp = await saveSellTrade(item)
                if (!resp?.status) {
                    tradeResponses.push({
                        ...resp,
                        item
                    })
                }
            }
        }

        if (tradeResponses?.length) {
            return res.status(201).json({
                status: true,
                message: "Some Transactions failed due to errors",
                data: tradeResponses,
            });
        }

        return res.status(201).json({
            status: true,
            message: "Bulk Trades Successfully Completed."
        });
    } catch (err) {
        let errMsg = err?.message || ""
        return res.status(500).json({
            status: false,
            message: errMsg || "Something Went Wrong"
        });
    }
}




