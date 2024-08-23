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
    document.querySelector(".side")?document.querySelector(".side").remove():console.log(DEFAULT_MOD_PREFIX + "Реклама уже отсутсвует.");
})


// Дефолтные рабочие значения
const INCLUDED_GAMEMODES = [1,3,5,8,9,10,11,13,14,15,17,18,20,21,24]

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
const DEFAULT_GAMEMODES = {
    NORMAL : 0,
    SECRET : 1,
    SANDWICH : 2,
    KNOCKOFF : 3,
    ICEBREAKER : 4,
    SCORE : 5,
    ANIMATION : 6,
    SOLO : 7,
    BACKGROUND : 8,
    COMPLEMENT : 9,
    STORY : 10,
    COOP : 11,
    MASTERPIECE : 12,
    MISSINGPIECE : 13,
    CORPSE : 14
}

const INCLUDED_STATES = [24,20,5,3,4]

const REQUIRED_MESSAGES = [
    {
        state : DEFAULT_GAME_STATES.FINISHING,
        necessity : [24],
        output : ["CURRENT_GAME_STATE"]
    },
    {
        state : DEFAULT_GAME_STATES.LOBBY,
        necessity : [20, 5],
        output : ["CURRENT_GAME_STATE"]
    }
]
const REQUIRED_MESSAGES_ALTERED = [
    {
        state : DEFAULT_GAME_STATES.DRAWING,
        necessity : [5],
        output : "CURRENT_GAME_STATE"
    },
    {
        state : DEFAULT_GAME_STATES.WRITING,
        necessity : [3],
        output : "CURRENT_GAME_STATE"
    },
    {
        state : DEFAULT_GAME_STATES.WATCHING,
        necessity : [4],
        output : "CURRENT_GAME_STATE"
    }
]
const REQUIRED_MESSAGE_GAMEMODES = [
    {
        state : DEFAULT_GAMEMODES.NORMAL,
        necessity : [1],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.SECRET,
        necessity : [3],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.SANDWICH,
        necessity : [5],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.KNOCKOFF,
        necessity : [8],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.ICEBREAKER,
        necessity : [9],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.SCORE,
        necessity : [10],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.ANIMATION,
        necessity : [11],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.SOLO,
        necessity : [13],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.BACKGROUND,
        necessity : [14],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.COMPLEMENT,
        necessity : [15],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.STORY,
        necessity : [17],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.COOP,
        necessity : [18],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.MASTERPIECE,
        necessity : [20],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.MISSINGPIECE,
        necessity : [21],
        output : ["CURRENT_GAMEMODE"]
    },
    {
        state : DEFAULT_GAMEMODES.CORPSE,
        necessity : [24],
        output : ["CURRENT_GAMEMODE"]
    }
]

const PING_IGNORE = "3"


// Внутренние переменные (На файл скрипта)
let CLASS_INSTANCES = {}
let CURRENT_TURN = -1


// Глобальные переменные (На всю страницу)
window.SOCKETS = []
window.CURRENT_GAME_STATE = DEFAULT_GAME_STATES.MAIN_MENU
window.CURRENT_GAMEMODE = DEFAULT_GAMEMODES.NORMAL


// Функции
function getKeyByValue(object, value) {
    if (value != null) {
        return Object.keys(object).find(key => object[key] === value);
    }
}

function checkState(message, gameStates) {
    for (const item of gameStates) {
        if (item.necessity.includes(message)) {
            return {
                state : item.state,
                output : item.output
            }
        }
    }
    return null
}

function getTurn(message) {
    if (message[2].turnNum) {
        return message[2].turnNum;
    }
}

function getGamestate(message) {
    let stateToCheck;
    let requiredMessages;
    if (message[1] !== 11 && INCLUDED_STATES.includes(message[1])) {
        stateToCheck = message[1];
        requiredMessages = REQUIRED_MESSAGES;
    } 
    else if (INCLUDED_STATES.includes(message[2]?.screen)) {
        stateToCheck = message[2].screen;
        requiredMessages = REQUIRED_MESSAGES_ALTERED;
    }
    if (stateToCheck) {
        const finish = checkState(stateToCheck, requiredMessages);
        updateGame(finish)
        console.log(`${DEFAULT_MOD_PREFIX}Игре задано новое состояние - ${getKeyByValue(DEFAULT_GAME_STATES, CURRENT_GAME_STATE)}`);
        CURRENT_TURN = getTurn(message);
    }
}

function getGamemode(message) {
    if (INCLUDED_GAMEMODES.includes(message[2]) && message[1] == 26) {
        const finish = checkState(message[2], REQUIRED_MESSAGE_GAMEMODES);
        updateGame(finish);
    }
}

function updateGame(finish) {
    window[finish.output] = finish.state;
    console.log(`${DEFAULT_MOD_PREFIX} Игре задан новый режим - ${getKeyByValue(DEFAULT_GAMEMODES, CURRENT_GAMEMODE)}`);
}

function messageUpdate(webSocket) {
    webSocket.addEventListener("message", (event)=>{
        let message
        if (event.data != PING_IGNORE) {
            try {
                message = JSON.parse(event.data.slice(2).toString())
                getGamestate(message)
                getGamemode(message)
            } catch (error) {
                console.warn(DEFAULT_MOD_PREFIX + "Переменная message содержит не предусмотренное значение.");
            }
        }
    })
}