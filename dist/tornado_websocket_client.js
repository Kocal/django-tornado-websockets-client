var TornadoWebSocketClient;

TornadoWebSocketClient = (function() {

    /**
     * Initialize a new WebSocket client which handle I/O behavior of TornadoWebSocket.
     *
     */
    function TornadoWebSocketClient(websocket) {
        if (!(websocket instanceof TornadoWebSocket)) {
            throw new Error("Expected TornadoWebSocket instance, got '" + websocket + "'");
        }
        this.websocket = websocket;
        this.events = {};
    }

    TornadoWebSocketClient.prototype.onmessage = function(event) {
        var callback, data, error, passed_data, passed_event;
        try {
            data = JSON.parse(event.data);
        } catch (error) {
            console.error("Can not parse invalid JSON.");
            return;
        }
        passed_event = data.event;
        passed_data = data.data;
        if (passed_event === void 0 || passed_data === void 0) {
            console.error('Can not get passed event or passed data.');
            return;
        }
        callback = this.events[passed_event];
        if (callback === void 0) {
            console.error("There is no callback for '" + passed_event + "' passed event.");
            return;
        }
        return callback(passed_data);
    };

    TornadoWebSocketClient.prototype.on = function(event, callback) {
        this.events[event] = callback;
    };

    TornadoWebSocketClient.prototype.emit = function(event, data) {
        this.websocket.emit(event, data, false);
    };

    return TornadoWebSocketClient;

})();