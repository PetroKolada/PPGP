// Подключение к вебсокету
const originalSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(...args) {
    if (window.SOCKETS.indexOf(this) === -1){
        window.SOCKETS.push(this);
        messageUpdate(this)
    }
    return originalSend.call(this, ...args);
};

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".side")?.remove()
})


// Глобальные переменные (На всю страницу)
window.SOCKETS = []


// Дефолтные рабочие значения
const DEFAULT_ABOUT = {
    name : "PPGP",
    version : "0.1A",
    authors : ["P0nya7no", "PSEUD0programmer"]
}
const DEFAULT_MOD_PREFIX = "PPGP : "
const DEFAULT_GAME_STATES = {
    MAIN_MENU : 0,
    LOBBY : 1,
    WRITING : 2,
    DRAWING : 3,
    WATCHING : 4,
    FINISHING : 5
}

const INCLUDED_STATES = [24,20,5,3,4]

const REQUIRED_MESSAGES = [
    {
        state : DEFAULT_GAME_STATES.WATCHING,
        necessity : [24]
    },
    {
        state : DEFAULT_GAME_STATES.LOBBY,
        necessity : [20, 5]
    }
]
const REQUIRED_MESSAGES_ALTERED = [
    {
        state : DEFAULT_GAME_STATES.DRAWING,
        necessity : [5]
    },
    {
        state : DEFAULT_GAME_STATES.WRITING,
        necessity : [3]
    },
    {
        state : DEFAULT_GAME_STATES.WATCHING,
        necessity : [4]
    }
]

const PING_IGNORE = "3"


// Внутренние переменные (На файл скрипта)
let CLASS_INSTANCES = {}
let CURRENT_TURN = -1
let CURRENT_GAME_STATE = DEFAULT_GAME_STATES.MAIN_MENU


// Функции
function getKeyByValue(object, value) {
    if (value != null) {
        return Object.keys(object).find(key => object[key] === value);
    }
}

function checkState(message, gameStates) {
    for (const item of gameStates) {
        if (item.necessity.includes(message)) {
            return item.state
        }
    }
    return null
}

function getTurn(message) {
    if (message[2].turnNum) {
        return message[2].turnNum;
    }
}

function messageUpdate(webSocket) {
    webSocket.addEventListener("message", (event)=>{
        let message
        if (event.data != PING_IGNORE) {
            try {
                message = JSON.parse(event.data.slice(2).toString())
                    if (message[1] != 11 && INCLUDED_STATES.includes(message[1])) {
                        CURRENT_GAME_STATE = checkState(message[1], REQUIRED_MESSAGES)
                        console.log(DEFAULT_MOD_PREFIX + "Игре задан новый state - " + getKeyByValue(DEFAULT_GAME_STATES, CURRENT_GAME_STATE));
                        CURRENT_TURN = getTurn(message)
                        
                    }else if(INCLUDED_STATES.includes(message[2].screen)){
                        CURRENT_GAME_STATE = checkState(message[2].screen, REQUIRED_MESSAGES_ALTERED)
                        console.log(DEFAULT_MOD_PREFIX + "Игре задан новый state - " + getKeyByValue(DEFAULT_GAME_STATES, CURRENT_GAME_STATE));
                        CURRENT_TURN = getTurn(message)
                    }
            } catch {
                console.warn(DEFAULT_MOD_PREFIX + "Переменная message содержит не предусмотренное значение.");
            }
        }
    })
}