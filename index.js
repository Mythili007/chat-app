const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const PORT = 6001;
const chatRouter = require("./routes/chats.js");

const http = require('http').createServer(app);
const io = require("socket.io");

const moment = require("moment")
// Integrating socketio
const socket = io(http);
// Db connection
const Chat = require('./chats.schema.js');
const dbConnection = require('./dbConnection.js');
let userInfo;
// var dbConnectionRef
// dbConnection.then((db) => {
    //     dbConnectionRef = db
    // });
    
    
// Middleware for parsing json in body payload
app.use(bodyParser.json());
// Add routes
app.use("/chats", chatRouter);
// Set the express.static middleware
app.use(express.static(__dirname + "/client"));

// When user connects
socket.on("connection", (socketConn) => {
    console.log("User Connected!!"); // Prints when a new connection made
    // When user disconnects
    socketConn.on('disconnect', () => {
        console.log("User Disconnected!!");
    });

    socketConn.on('new-user', _userInfo => {
        console.trace(_userInfo)
        userInfo = _userInfo;
        const usrName = userInfo.userName;
        
        console.trace(usrName)
        socketConn.emit('user-connected', userInfo)
    });

    // When someone types something
    socketConn.on('typing', (data) => {
        // broadcasting to everyone
        socketConn.broadcast.emit('notifyTyping', {
            user: data.user,
            message: data.message,
        });
    });

    // When someone stops typing
    socketConn.on('stopTyping', () => {
        socketConn.broadcast.emit('notifyStopTyping');
    });

    // Someone sends message
    socketConn.on('sendMessage', (msg) => {
        const msgJSON = JSON.parse(msg)
        console.log("Logging message: ", msgJSON);

        // Broadcast message to everyone
        socketConn.broadcast.emit('msgReceived', msgJSON);

        // Create chat thread in Mongo DB while broadcasting to everyone
        dbConnection.then((db) => {
            console.log("Db connection with the server....");

            let data = new Chat({
                message: msgJSON.message,
                senderId: msgJSON.username,
                sendDate: Date(msgJSON.sendDate),
            });

            data.save();
            // db.save(msgJSON);
        });
        // dbConnectionRef.save(msgJSON)
    });
});

// Server listening to the port
http.listen(PORT, () => {
    console.log("Localhost running on:", PORT);
});
