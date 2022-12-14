/* file structure:

global variables

assignments and calls

functions

events */


/* global variables */

const enterChatButton = document.querySelector("button");
const sendMessageButton = document.querySelector(".button > ion-icon");
const textMessage = document.querySelector(".input-message");
const lastSelectedParticipant = document.querySelector(".last-selected-participant");
const lastSelectedVisibility = document.querySelector(".last-selected-visibility");
const listParticipants = document.querySelector(".participants");
const loading = document.querySelector(".loading");
const menuScreen = document.querySelector(".menu-screen");
const messagesList = document.querySelector(".messages");
const username = document.querySelector(".username");
let lastSelectedParticipantName = "Todos";
let lastSelectedVisibilityName = "message";
let messages;
let object;


/* assignments */

lastSelectedParticipant.innerHTML = lastSelectedParticipantName;
lastSelectedVisibility.innerHTML = "público";


/* functions */

function closeMenu() {
    menuScreen.classList.add("hidden");
}

function compareObjects(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function enterChat() {
    const promiseChat = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promiseChat.then(processResponseEnterChat);
}

function feedChat(array) {
	for (let i = 0; i < array.length; i++) {
        const type = array[i].type;

        if (type === "status") {
            messagesList.innerHTML +=
                `<li class="${type}">
                    <p>
                        <span>(${formatTime(array[i].time)})</span>
                        <span>${array[i].from}</span>
                        ${array[i].text}
                    </p>
                </li>`;
        } else {
            if (array[i].to === "Todos" || array[i].to === object.name) {
                messagesList.innerHTML +=
                    `<li class="${type}">
                        <p>
                            <span>(${formatTime(array[i].time)})</span>
                            <span>${array[i].from}</span>
                            ${type === "private_message" ? "reservadamente " : ""}para <span>${array[i].to}</span>: ${array[i].text}
                        </p>
                    </li>`;
            }
        }
    }
}

function formatTime(time) {
    const hour = Number(time.slice(0,2));
    const newHour = hour - 3 + (hour < 4 ? 12 : 0);

    return (newHour < 10 ? "0" : "") + newHour + time.slice(2);
}

function openMenu() {
    menuScreen.classList.remove("hidden");
}

function processErrorSendMessage() {
    alert("Algum problema ocorreu! Tente novamente.");
    window.location.reload();
}

function processErrorLogin(error) {
    const statusCode = error.response.status;

    if (statusCode === 504) {
        alert("Houve algum problema na comunicação com o servidor! Aguarde um momento e tente novamente.");
    } else if (statusCode === 400) {
        alert("Este nome já está em uso, tente outro nome.");
    } else {
        alert("Algum problema ocorreu! Tente novamente.");
    }

    username.classList.remove("hidden");
    enterChatButton.classList.remove("hidden");
    loading.classList.add("hidden");
}

function processResponseEnterChat(response) {
    messages = response.data;
    feedChat(messages);

    setInterval(function () {
        updateChat();
    }, 3000);
}

function processResponseLogin() {
    document.querySelector(".login-screen").remove();
    document.querySelector("header").classList.remove("hidden");
    document.querySelector("main").classList.remove("hidden");
    document.querySelector("footer").classList.remove("hidden");

    setInterval(function () {
        axios.post("https://mock-api.driven.com.br/api/v6/uol/status", object);
    }, 5000);

    setInterval(function () {
        const promiseParticipants = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
        promiseParticipants.then(processResponseParticipants);
    }, 10000);

    enterChat();
}

function processResponseSendMessage() {
    textMessage.value = "";
    sendMessageButton.setAttribute("onclick", "sendMessage()");
}

function processResponseParticipants(response) {
    const participants = response.data;
    listParticipants.innerHTML =
        `<li data-identifier="participant" onclick="select(this)">
            <span>
                <ion-icon name="people"></ion-icon>
                
                <span class="name">Todos</span>
            </span>
            
            <ion-icon name="checkmark-sharp" ${lastSelectedParticipantName === "Todos" ? "" : 'class="hidden"'}></ion-icon>
        </li>`

    for (let i = 0; i < participants.length; i++) {
        listParticipants.innerHTML +=
            `<li data-identifier="participant" onclick="select(this)">
                <span>
                    <ion-icon name="person-circle"></ion-icon>
                    
                    <span class="name">${participants[i].name}</span>
                </span>
                
                <ion-icon name="checkmark-sharp" ${lastSelectedParticipantName === participants[i].name ? "" : 'class="hidden"'}></ion-icon>
            </li>`
    }
}

function processResponseUpdateChat(response) {
    const update = response.data;
    
    for (let i = 0; i < update.length; i++) {
        if (compareObjects(messages[99],update[i])) {
            feedChat(update.slice(i + 1));
            messagesList.lastElementChild.scrollIntoView();

            messages = update;
            return;
        }
    }
}

function select(option) {
    const optionType = option.parentNode;
    const selected = optionType.querySelector("ion-icon:nth-child(2):not(.hidden)");

    if (selected) {
        selected.classList.add("hidden");
    }

    option.querySelector("ion-icon:nth-child(2)").classList.remove("hidden");
    const name = option.querySelector(".name").innerHTML;

    if (optionType.classList.contains("participants")) {
        lastSelectedParticipantName = name;
        lastSelectedParticipant.innerHTML = lastSelectedParticipantName;
        
    } else {
        lastSelectedVisibility.innerHTML = name === "Público" ? "público" : "reservadamente";
        lastSelectedVisibilityName = name === "Público" ? "message" : "private_message";
    }
}

function sendMessage() {
    sendMessageButton.removeAttribute("onclick");

    const objectMessage = {
        from: object.name,
        to: lastSelectedParticipantName,
        text: textMessage.value,
        type: lastSelectedVisibilityName
    };

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", objectMessage);
    promise.then(processResponseSendMessage);
    promise.catch(processErrorSendMessage);
}

function updateChat() {
    const update = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    update.then(processResponseUpdateChat);
}

function validateUsername() {
    username.classList.add("hidden");
    enterChatButton.classList.add("hidden");
    loading.classList.remove("hidden");

    object = {name: username.value};
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", object);
    promise.then(processResponseLogin);
    promise.catch(processErrorLogin);
}


/* events */

document.querySelector(".input-message").addEventListener("keypress", function(event) {
    if(event.key === 'Enter') {
        sendMessageButton.click();
    }
});

document.querySelector(".username").addEventListener("keypress", function(event) {
    if(event.key === 'Enter') {
        enterChatButton.click();
    }
});
