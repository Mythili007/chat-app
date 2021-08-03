const socket = io();
const messages = document.getElementById('messages');
// const moment = require("moment");
// const userName = prompt("Recognize yourself!");
// socket.emit('new-user', userName);

(function () {
    $("form").submit(function (win) {
        let list = document.createElement("li");
        // Preventing window reloading
        win.preventDefault();
       /*  socket.on('user-connected', userName => {
        console.log("file: script.js ~ line 13 ~ userName", userName)
            messages.appendChild(list).append(`${userName} connected`);
        }); */
        socket.emit("sendMessage", $("input").val());

        messages.appendChild(list).append($("input").val());
        let span = document.createElement("span");
        messages.appendChild(span).append("by UserA: just now");

        $("input").val("");
        return false;
    });

    socket.on("msgReceived", data => {
        console.log("Lets check the data: ", data);
        let list = document.createElement("li");
        let span = document.createElement("span");
        let messages = document.getElementById("messages");
        messages.appendChild(list).append(data.message);
        messages.appendChild(span).append("by UserB: just now");
    });
})();

// Fetch the history of chat messages from db
const fetchMsgs = function () {
    fetch("/chats").then(data => {
        console.log("file: script.js ~ line 32 ~ fetch ~ data", data)
        return data.json();
    }).then(jsonData => {
        jsonData.map(msg => {
            let li = document.createElement("li");
            let span = document.createElement("span");
            messages.appendChild(li).append(msg.message);
            messages
                .appendChild(span)
                .append("by " + msg.senderId + ": " + formatTimeAgo(msg.createdAt));
        });
    });
};

fetchMsgs();

let msgInput = document.getElementById("messages");
let typingStatus = document.getElementById("typingstatus");

msgInput.addEventListener("keypress", () => {
    socket.emit("typing", {
        user: "Someone",
        message: "is typing..."
    });
});

socket.on("notifyTyping", data => {
    console.log("data: ", data);
    typingStatus.innerText = data.user + " " + data.message;
});

//stop typing
msgInput.addEventListener("keyup", () => {
    socket.emit("stopTyping", "");
});

socket.on("notifyStopTyping", () => {
    typing.innerText = "";
});