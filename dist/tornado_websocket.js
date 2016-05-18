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
         * Registered events
         * @type {Object}
         * @private
         */
        this.events = {};
        this.connect();
    }

    TornadoWebSocket.prototype.connect = function() {
        return this.websocket = null;
    };

    TornadoWebSocket.prototype.on = function(event, callback) {

        /**
         * Bind a function to an event.
         * @param {String}    event     Event name
         * @param {Function}  callback  Function to execute when event `event` is sent by the server
         */
        if (typeof callback !== 'function') {
            throw new TypeError("You must pass a function for 'callback' parameter.");
        }
        if (this.events[event] !== void 0) {
            console.warn("Event '" + event + "' event is already binded.");
        }
        return this.events[event] = callback;
    };

    TornadoWebSocket.prototype.buildUrl = function() {

        /**
         * Return an URL built from `this.options`
         * @returns {String}
         */
        var protocol;
        protocol = this.options.secure ? 'wss' : 'ws';
        return protocol + "://" + this.options.host + ":" + this.options.port + "/ws" + this.path;
    };

    return TornadoWebSocket;

})();