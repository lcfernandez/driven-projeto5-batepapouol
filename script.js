/* file structure:

global variables

functions

calls? */


const messagesList = document.querySelector("ul");
let object;
let messages;

askUsername();

function askUsername() {
    const username = prompt("Qual é o seu lindo nome?");
    object = {name: username};

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
    askUsername();
}

function enterChat() {
    const promiseChat = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promiseChat.then(processResponse);
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
                    messagesList.innerHTML += `<li class="${type}"><em>(${newMessages[j].time})</em> &nbsp<b>${newMessages[j].from}</b> &nbsp${newMessages[j].text}</li>`;
                } else {
                    messagesList.innerHTML += `<li class="${type}"><em>(${newMessages[j].time})</em> &nbsp<b>${newMessages[j].from}</b> ${type === "private_message" ? "&nbspreservadamente" : ""}&nbsppara&nbsp<b>${newMessages[j].to}</b>: ${newMessages[j].text}</li>`;
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
            messagesList.innerHTML += `<li class="${type}"><em>(${messages[i].time})</em> &nbsp<b>${messages[i].from}</b> &nbsp${messages[i].text}</li>`;
        } else {
            messagesList.innerHTML += `<li class="${type}"><em>(${messages[i].time})</em> &nbsp<b>${messages[i].from}</b> ${type === "private_message" ? "&nbspreservadamente" : ""}&nbsppara&nbsp<b>${messages[i].to}</b>: ${messages[i].text}</li>`;
        }
    }

    setInterval(function () {
        updateChat();
    }, 3000);
}
