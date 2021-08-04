// const socket = io();
const socket = io("http://localhost:6001");

// Get a hold of necessary UI elements
const messages = document.getElementById('messages');
let msgInput = document.getElementById("messages");
let typing = document.getElementById("typing");

const userName_value = prompt("Recognize yourself!");
const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

let userInfo = {
    userName: userName_value,
    profileColor: userColor
}

function setCSSStyles(list, span, data) {
    list.style.marginTop = "20px";
    list.style.borderRadius = "10px";
    list.style.overflowWrap = "break-word";
    
    span.style.fontSize = "1.2rem";
    if (data)
        span.style.color = data.profileColor;
}

/*
 * Fetch the history of chat messages from db
 */
function fetchMsgs(name) {
    fetch("/chats").then(data => {
        return data.json();
    }).then(jsonData => {
        jsonData.map(msg => {
            let li = document.createElement("li");
            let span = document.createElement("span");

            // Adding styles
            setCSSStyles(li, span);
            messages
                .appendChild(li)
                .append(msg.senderId + " : " + msg.message);
            messages
                .appendChild(span)
                .append(moment(msg.createdAt).fromNow());
        });
    }).catch(err => {
        console.error(err);
        alert("Connection failed ", err);
    });
};

// Attach event listeners for UI elements
const input_var_ID = "input"

$("form").submit(function (windowRef) {
    // Preventing window reloading
    windowRef.preventDefault();

    var dataJSON = {
        'message': $(input_var_ID).val(),
        'username': userName_value,
        'sendDate': Date.now(),
        'profileColor': userColor,
    };
    $(input_var_ID).val("");
    // When someone sends any message
    socket.emit("sendMessage", JSON.stringify(dataJSON));
    populateUI(dataJSON);

    return false;
});

msgInput.addEventListener("keypress", () => {
    socket.emit("typing", {
        user: "Someone",
        message: "is typing..."
    });
});

msgInput.addEventListener("keyup", () => {
    socket.emit("stopTyping", "");
});

// Attach Socket events
socket.on("notifyTyping", data => {
    console.log("data: ", data);
    typing.innerText = data.user + " " + data.message;
});

socket.on("notifyStopTyping", () => {
    typing.innerText = "";
});

socket.on('user-connected', userInfo => {
    $("#userId").text(userInfo.userName);
    $("#userId").css("color", userInfo.profileColor);
});

function populateUI(dataJSON) {
    let list = document.createElement("li");
    let span = document.createElement("span");
    let messages = document.getElementById("messages");

    // Setting css properties
    setCSSStyles(list, span, dataJSON);

    messages.appendChild(list).append(dataJSON.username + " : " + dataJSON.message);
    messages.appendChild(span).append(moment(dataJSON.sendDate).fromNow());
}

socket.on('sendMessage', data => {
    console.log("SendMessage Lets check the data: ", data);
    populateUI(data);
});

socket.on("msgReceived", data => {
    console.log("msgReceived Lets check the data: ", data);
    populateUI(data);
});
socket.emit('new-user', userInfo);

// -------------   Invoke necessary functions ----------
fetchMsgs();