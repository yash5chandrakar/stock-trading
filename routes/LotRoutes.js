const express = require('express')
const router = express.Router();
const lotController = require("../controllers/lotController")

// Route to sell stocks and realize lots using FIFO method
router.post('/sell/fifo', lotController.sellFromLotsFIFO);

// Route to sell stocks and realize lots using LIFO method
router.post('/sell/lifo', lotController.sellFromLotsLIFO);

// Route to get details of a specific lot by lot_id
router.get('/getlot/:lot_id', lotController.getLot);

// Route to get all lots for a specific stock
router.get('/getlots', lotController.getAllLots);

module.exports = router;