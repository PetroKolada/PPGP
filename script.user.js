// Подключение к вебсокету
const originalSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(...args) {
    if (window.sockets.indexOf(this) === -1){
        window.sockets.push(this);
        messageListener()
    }
    return originalSend.call(this, ...args);
};

//////////////////////////////////////////////
// Создание переменных

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".side").remove()
})