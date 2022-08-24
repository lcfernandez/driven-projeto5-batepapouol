/* file structure:

global variables

functions

calls? */

const messagesList = document.querySelector("ul");

const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
promise.then(processResponse);

function processResponse(response) {
    const messages = response.data;
    let time;
    let type;

	for (let i = 0; i < messages.length; i++) {
        type = messages[i].type;

        if (type === "status") {
            messagesList.innerHTML += `<li class="${type}"><em>(${messages[i].time})</em> &nbsp<b>${messages[i].from}</b> &nbsp${messages[i].text}</li>`;
        } else {
            messagesList.innerHTML += `<li class="${type}"><em>(${messages[i].time})</em> &nbsp<b>${messages[i].from}</b> ${type === "private_message" ? "&nbspreservadamente" : ""}&nbsppara&nbsp<b>${messages[i].to}</b>: ${messages[i].text}</li>`;
        }
        
        // simplification attempt
        // messagesList.innerHTML += `<li class="${type}">(${messages[i].time}) ${messages[i].from} ${type === "status" ? "" : type === "private_message" ? `reservadamente para ${messages[i].to}` : `para ${messages[i].to}`} ${messages[i].text}</li>`;
    }
}
