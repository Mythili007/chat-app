const socket = io();

// Get a hold of necessary UI elements
const messages = document.getElementById('messages');
let msgInput = document.getElementById("messages");
let typing = document.getElementById("typing");
const chatbox = document.getElementById("chatbox");

const userName_value = prompt("Recognize yourself!");
const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

let userInfo = {
    userName: userName_value,
    profileColor: userColor
}

function setCSSStyles(list, span) {
    list.style.marginTop = "20px";
    list.style.borderRadius = "10px";
    list.style.overflowWrap = "break-word";
    span.style.fontSize = "1.2rem";
}

/*
 * Fetch the history of chat messages from db
 */
function fetchMsgs(name) {
    fetch("/chats").then(data => {
        return data.json();
    }).then(jsonData => {
        jsonData.map(msg => {
            console.log(msg)

            const temp_userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            var userProfileColor = (msg.profileColor) ? msg.profileColor : temp_userColor;

            jsonObjNormalization = {
                'message': msg.message,
                'username': msg.senderId,
                'sendDate': Date.parse(msg.createdAt),
                'profileColor': userProfileColor,
            }
            populateUI(jsonObjNormalization);
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
    let list_forMessage = document.createElement("li");
    let paragraph_forMessage = document.createElement("p");
    let span_forDate = document.createElement("span");
    let span_forName = document.createElement("span");
    let span_forMessage = document.createElement("span");
    let messages = document.getElementById("messages");

    // Setting css properties
    setCSSStyles(list_forMessage, span_forDate);
    span_forName.style.color = dataJSON.profileColor;
    span_forName.style.fontWeight = "bold";

    paragraph_forMessage.appendChild(span_forName).append(dataJSON.username + " : ")
    paragraph_forMessage.appendChild(span_forMessage).append(dataJSON.message);
    list_forMessage.appendChild(paragraph_forMessage);

    list_forMessage.appendChild(span_forDate).append(moment(dataJSON.sendDate).fromNow());
    messages.appendChild(list_forMessage);

    // algin left or right
    var isMine = dataJSON.username == userName_value;
    var textAlignPosition = (isMine == true) ? "right" : "left";
    list_forMessage.style.textAlign = textAlignPosition;

    // scroll to the bottom
    messages.scrollIntoView(false)
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