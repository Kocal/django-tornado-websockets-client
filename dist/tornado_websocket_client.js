var TornadoWebSocketClient;

TornadoWebSocketClient = (function() {
    function TornadoWebSocketClient(websocket) {
        if (!(websocket instanceof TornadoWebSocket)) {
            throw new Error("Expected TornadoWebSocket instance, got '" + websocket + "'");
        }
        this.websocket = websocket;
    }

    TornadoWebSocketClient.prototype.on = function(event, callback) {
        return console.log(event, callback);
    };

    TornadoWebSocketClient.prototype.emit = function(event, data) {
        return console.log(event, data);
    };

    return TornadoWebSocketClient;

})();