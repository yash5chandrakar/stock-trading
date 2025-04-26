const express = require("express");
const router = express.Router();
const tradeRoutes = require("./TradeRoutes.js");
const LotRoutes = require("./LotRoutes.js");

router.use("/trades", tradeRoutes)
router.use("/lot", LotRoutes)

module.exports = router;