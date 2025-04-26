const express = require('express')
const router = express.Router();
const tradeController = require("../controllers/tradeControllers")

// Route to add a new trade
router.post('/addtrade', tradeController.addtrades);

// Route to update an existing trade
router.put('/updatetrade', tradeController.updateTrade);

// Route to get a single trade by trade_id
router.post('/gettrade', tradeController.getTrade);

// Route to get all trades
router.get('/getalltrades', tradeController.getAllTrades);

// Route to delete a trade by trade_id
router.delete('/deletetrade/:id', tradeController.deleteTrade);

// Bulk Operation
router.post("/bulktrade", tradeController.bulkTrade)

module.exports = router;