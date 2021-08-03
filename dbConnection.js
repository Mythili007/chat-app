const mongoose = require('mongoose');

const mongoUrl = "mongodb://localhost:27017/chats";

mongoose.Promise = require('bluebird');

const connect = mongoose.connect(mongoUrl, {
    useNewUrlParser: true, useUnifiedTopology: true
});

module.exports = connect;