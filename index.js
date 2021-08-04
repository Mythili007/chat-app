const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const PORT = 6001;
const chatRouter = require("./routes/chats.js");

const http = require('http').createServer(app);
const io = require("socket.io");


// Middleware for parsing json in body payload
app.use(bodyParser.json());

// Add routes
app.use("/chats", chatRouter);

// Set the express.static middleware
app.use(express.static(__dirname + "/client"));

// Integrating socketio
const socket = io(http);
// Db connection
const Chat = require('./chats.schema.js');
const dbConnection = require('./dbConnection.js');
const users = {};
// Create an event listener
// When user connects
socket.on("connection", (socket) => {
    console.log("User Connected!!"); // Prints when a new connection made
    // When user disconnects
    socket.on('disconnect', () => {
        console.log("User Disconnected!!");
    });

    /* socket.on('new-user', name => {
    console.log("file: index.js ~ line 37 ~ socket.on ~ name", name)
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    }); */

    // When someone types something
    socket.on('typing', (data) => {
        // broadcasting to everyone
        socket.broadcast.emit('notifyTyping', {
            user: data.user,
            message: data.message,
        });
    });

    // When someone stops typing
    socket.on('stopTyping', () => {
        socket.broadcast.emit('notifyStopTyping');
    });

    // Someone sends message
    socket.on('sendMessage', (msg) => {
        console.log("Logging message: ", msg);

        // Broadcast message to everyone
        socket.broadcast.emit('msgReceived', {
            message: msg
        });

        // Create chat thread in Mongo DB while broadcasting to everyone
        dbConnection.then((db) => {
            console.log("Db connection with the server....");

            let data = new Chat({
                message: msg,
                senderId: "Anonymous",
                // userId: "Mythili",
            });

            data.save();
        });

    });
});

// Server listening to the port
http.listen(PORT, () => {
    console.log("Localhost running on:", PORT);
});
