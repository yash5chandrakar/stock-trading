const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();
app.use(bodyParser.raw());
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(cors());

let routes = require("./routes/index");

app.get("/", (req, res) => {
    return res.status(200).send("Stock Trading App by Yash Chandrakar")
})

app.use("/api", routes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});