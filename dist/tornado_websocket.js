var TornadoWebSocket, tws;

tws = function(path, options) {
    return new TornadoWebSocket(path, options);
};

TornadoWebSocket = (function() {

    /**
     * Initialize a new WebSocket object with given options.
     * @param {String}  path            Url of a django-tornado-websockets application
     * @param {Object}  options         Object options
     * @param {String}  options.host    Host used for connection
     * @param {Number}  options.port    Port user for connection
     * @param {Boolean} options.secure  Using 'ws' or 'wss' protocol
     */
    function TornadoWebSocket(path, options) {
        if (!(this instanceof TornadoWebSocket)) {
            return new TornadoWebSocket(path, options);
        }
        if (path === void 0) {
            throw new ReferenceError("You must pass 'path' parameter during 'TornadoWebSocket' instantiation.");
        }

        /**
         * WebSocket instance
         * @type {WebSocket}
         */
        this.websocket = null;

        /**
         * Configuration values
         * @type {Object}
         * @private
         */
        this.options = _.merge({
            host: 'localhost',
            port: 8000,
            secure: false
        }, options);

        /**
         * Path of a django-tornado-websockets application
         * @type {String}
         * @private
         */
        this.path = path.trim();
        this.path = this.path[0] !== '/' ? '/' + this.path : this.path;

        /**
         * Generated URL by path and configuration values
         * @type {String}
         * @private
         */
        this.url = this.buildUrl();

        /**
         * Reserved events (open, close, error and message)
         * @type {Object}
         * @private
         */
        this.reservedEvents = {
            open: function(socket, event) {
                return console.info('New connection');
            },
            close: function(reason, event) {
                return console.info('Connection closed', reason, event);
            },
            error: function(event) {
                return console.info('Got an error', event);
            },
            message: function(event) {
                return console.info('Got a message');
            }
        };

        /**
         * Events defined by the user
         * @type {Object}
         * @private
         */
        this.userEvents = {};
    }

    TornadoWebSocket.prototype.connect = function() {
        this.websocket = new WebSocket(this.url);
        this.client = new TornadoWebSocketClient(this);
        this.websocket.onopen = (function(_this) {
            return function(event) {
                return _this.reservedEvents.open(_this.client, event);
            };
        })(this);
        this.websocket.onclose = (function(_this) {
            return function(event) {
                return _this.reservedEvents.close(event.reason, event);
            };
        })(this);
        this.websocket.onerror = (function(_this) {
            return function(event) {
                return _this.reservedEvents.error(event);
            };
        })(this);
        this.websocket.onmessage = (function(_this) {
            return function(event) {
                return _this.client.onmessage(event);
            };
        })(this);
        return this;
    };


    /**
     * Bind a function to an event.
     * @param {String}    event     Event name
     * @param {Function}  callback  Function to execute when event `event` is sent by the server
     */

    TornadoWebSocket.prototype.on = function(event, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError("You must pass a function for 'callback' parameter.");
        }
        this.reservedEvents[event] = callback;
    };

    TornadoWebSocket.prototype.emit = function(event, data, broadcast) {
        if (data == null) {
            data = {};
        }
        if (broadcast == null) {
            broadcast = true;
        }
        data = JSON.stringify({
            event: event,
            data: data
        });
        return this.websocket.send(data);
    };


    /**
     * Return an URL built from `this.options`.
     * Path is auto-prefixed by "/ws".
     * @returns {String}
     */

    TornadoWebSocket.prototype.buildUrl = function() {
        var protocol;
        protocol = this.options.secure ? 'wss' : 'ws';
        return protocol + "://" + this.options.host + ":" + this.options.port + "/ws" + this.path;
    };

    return TornadoWebSocket;

})();