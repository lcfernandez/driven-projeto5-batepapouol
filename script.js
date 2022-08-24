/* file structure:

global variables

functions

calls? */


const messagesList = document.querySelector("ul");
let object;

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
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(processResponse);
}

function processResponse(response) {
    const messages = response.data;
    let type;

	for (let i = 0; i < messages.length; i++) {
        type = messages[i].type;

        if (type === "status") {
            messagesList.innerHTML += `<li class="${type}"><em>(${messages[i].time})</em> &nbsp<b>${messages[i].from}</b> &nbsp${messages[i].text}</li>`;
        } else {
            messagesList.innerHTML += `<li class="${type}"><em>(${messages[i].time})</em> &nbsp<b>${messages[i].from}</b> ${type === "private_message" ? "&nbspreservadamente" : ""}&nbsppara&nbsp<b>${messages[i].to}</b>: ${messages[i].text}</li>`;
        }
    }
}
