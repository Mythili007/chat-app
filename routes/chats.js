const express = require('express');
const bodyParser = require('body-parser');
const dbConnection = require('../dbConnection.js');
const chatModel = require("../chats.schema.js");
const router = express.Router();


router.get("/", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    dbConnection.then(async () => {
        const chats = await chatModel.find({});
        res.json(chats);
    });
});

module.exports = router;