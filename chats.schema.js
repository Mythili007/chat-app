const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    message: {
        type: String,
    },
    // createdAt: {
    //     type: Date.now(),
    // },
    userId: {
        type: String,
    },
    senderId: {
        type: String,
    },
    sendDate: {
        type: Date,
        default: Date.now(),
    },
}, {
    timestamps: true
});

let Chat = mongoose.model('chats', chatSchema);
module.exports = Chat;
