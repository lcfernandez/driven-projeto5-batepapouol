/* file structure:

global variables

functions

calls? */


const messagesList = document.querySelector(".messages");
let object;
let messages;

askUsername();

function askUsername() {
    const username = prompt("Qual é o seu nome?");
    object = {name: username};

    validateUsername();
}

function validateUsername() {
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", object);
    promise.then(processResponseLogin);
    promise.catch(processErrorLogin);
}

function processResponseLogin() {
    enterChat();

    setInterval(function () {
        axios.post("https://mock-api.driven.com.br/api/v6/uol/status", object);
    }, 5000);
}

function processErrorLogin() {
    const username = prompt("Este nome já está em uso, digite outro nome:");
    object = {name: username};

    validateUsername()
}

function enterChat() {
    const promiseChat = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promiseChat.then(processResponse);

    setInterval(function () {
        const promiseParticipants = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
        promiseParticipants.then(processResponseParticipants);
    }, 10000);
    
}

function updateChat() {
    const update = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    update.then(processRespondeUpdate);
}

function processRespondeUpdate(response) {
    const update = response.data;
    
    for (let i = 0; i < update.length; i++) {
        if (compareObjects(messages[99],update[i])) {
            const newMessages = update.slice(i + 1);
            let type;

            for (let j = 0; j < newMessages.length; j++) {
                type = newMessages[j].type;
        
                if (type === "status") {
                    messagesList.innerHTML += `<li class="${type}"><p><span>(${newMessages[j].time})</span> <span>${newMessages[j].from}</span> ${newMessages[j].text}</p></li>`;
                } else {
                    if (type !== "private_message" || newMessages[j].to === object.name) {
                        messagesList.innerHTML += `<li class="${type}"><p><span>(${newMessages[j].time})</span> <span>${newMessages[j].from}</span> ${type === "private_message" ? "reservadamente " : ""}para <span>${newMessages[j].to}</span>: ${newMessages[j].text}</p></li>`;
                    }
                }
            }

            messagesList.lastElementChild.scrollIntoView();
            messages = update;
            return;
        }
    }
}

function compareObjects(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function processResponse(response) {
    messages = response.data;
    let type;

	for (let i = 0; i < messages.length; i++) {
        type = messages[i].type;

        if (type === "status") {
            messagesList.innerHTML += `<li class="${type}"><p><span>(${messages[i].time})</span> <span>${messages[i].from}</span> ${messages[i].text}</p></li>`;
        } else {
            if (type !== "private_message" || messages[i].to === object.name) {
                messagesList.innerHTML += `<li class="${type}"><p><span>(${messages[i].time})</span> <span>${messages[i].from}</span> ${type === "private_message" ? "reservadamente " : ""}para <span>${messages[i].to}</span>: ${messages[i].text}</p></li>`;
            }
        }
    }

    setInterval(function () {
        updateChat();
    }, 3000);
}

let textMessage;

function sendMessage() {
    textMessage = document.querySelector("input").value;
    
    const objectMessage = {
        from: object.name,
        to: lastSelectedParticipantName,
        text: textMessage,
        type: lastSelectedVisibilityName
    };

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", objectMessage);
    promise.then(processResponseMessage);
    promise.catch(processErrorMessage);
}

function processResponseMessage() {
    document.querySelector("input").value = "";
}

function processErrorMessage() {
    window.location.reload();
}

const menuScreen = document.querySelector(".menu-screen");

function closeMenu() {
    menuScreen.classList.add("hidden");
}

function openMenu() {
    menuScreen.classList.remove("hidden");
}

const listParticipants = document.querySelector(".participants");

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

const lastSelectedParticipant = document.querySelector(".last-selected-participant");
const lastSelectedVisibility = document.querySelector(".last-selected-visibility");
let lastSelectedParticipantName = "Todos";
let lastSelectedVisibilityName = "message";

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

lastSelectedParticipant.innerHTML = lastSelectedParticipantName;
lastSelectedVisibility.innerHTML = "público";

document.addEventListener("keypress", function(event) {
    if(event.key === 'Enter') {
        document.querySelector(".button > ion-icon").click();
    }
});
