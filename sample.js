const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
// socket = io(http);


io.on("connection", (socket)=>{
    console.log("Connected to socket!!");
});

http.listen(5001, ()=>{
    console.log("App running on: 5001");
});