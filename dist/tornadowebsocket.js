'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TornadoWebSocket = factory();
    }
})(undefined, function () {
    'use strict';

    /**
     * Open a WebSocket connection between the client and the django-tornado-websocket server.
     * @example
     * let tws = new TornadoWebSocket('chat', { port: 8080 })
     *
     * tws.on('connect', event => {
     *     // Send the event 'user_joined' to the server
     *     tws.emit('user_joined', { user_id: 1 })
     *
     *     // And the server send the same event to the client
     *     tws.on('user_joined', user => {
     *         console.log(user.name)
     *         console.log(user.firstname)
     *     })
     * })
     *
     * tws.on('error', event => {
     *     console.log('Error: ', event)
     * })
     *
     * tws.on('close', event => {
     *     console.log('Close: ', event)
     * })
     */

    var TornadoWebSocket = function () {

        /**
         * Initialize a new WebSocket object with given options.
         *
         * @param {String}   path            Url of a django-tornado-websockets application
         * @param {Object}   options         Object options
         * @param {String}   options.host    Host used for connection
         * @param {Number}   options.port    Port user for connection
         * @param {Boolean}  options.secure  Using 'ws' or 'wss' protocol
         */
        function TornadoWebSocket(path) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            _classCallCheck(this, TornadoWebSocket);

            if (path === undefined) {
                throw new ReferenceError('You must pass « path » parameter during instantiation.');
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
            this.options = _extends({}, {
                host: location.hostname || 'localhost',
                port: 8000,
                secure: false
            }, options);

            /**
             * Path of a django-tornado-websockets application
             * @type {String}
             * @private
             */
            this.path = path.trim();
            this.path = this.path[0] === '/' ? this.path : '/' + this.path;

            /**
             * Generated URL by path and configuration values
             * @type {String}
             * @private
             */
            this.url = this.build_url();

            /**
             * Events defined by the user
             * @type {Object}
             * @private
             */
            this.events = {};

            this.connect();
        }

        /**
         * Initialize a new WebSocket connection and bind 'open', 'close', 'error' and 'message' events.
         */


        _createClass(TornadoWebSocket, [{
            key: 'connect',
            value: function connect() {
                var _this = this;

                this.websocket = new WebSocket(this.url);

                this.websocket.onopen = function (event) {
                    console.info('New connection', event);
                };
                this.websocket.onclose = function (event) {
                    console.info('Connection closed', event);
                };
                this.websocket.onerror = function (event) {
                    console.info('Error', event);
                };

                this.websocket.onmessage = function (event) {
                    try {
                        var data = JSON.parse(event.data);
                        var passed_event = data.event;
                        var passed_data = data.data;

                        if (passed_event === undefined || typeof passed_event !== 'string') {
                            console.warn('Can not get passed event from JSON data.');
                            return;
                        }

                        if (passed_data === undefined || (typeof passed_data === 'undefined' ? 'undefined' : _typeof(passed_data)) !== 'object') {
                            console.warn('Can not get passed data from JSON data.');
                            return;
                        }

                        var callback = _this.events[passed_event];

                        if (callback === undefined || typeof callback !== 'function') {
                            console.warn('Passed event « ' + passed_event + ' » is not binded.');
                            return;
                        }

                        callback(passed_data);
                    } catch (e) {
                        console.warn('Can not parse invalid JSON: ', event.data);
                    }
                };
            }

            /**
             * Bind a function to an event.
             * @param {String}    event     Event name
             * @param {Function}  callback  Function to execute when event `event` is sent by the server
             */

        }, {
            key: 'on',
            value: function on(event, callback) {
                if (typeof callback !== 'function') {
                    throw new TypeError('You must pass a function for « callback » parameter.');
                }

                if (['open', 'close', 'error'].indexOf(event) !== -1) {
                    this.websocket['on' + event] = callback;
                } else {
                    this.events[event] = callback;
                }
            }

            /**
             * Emit a couple event/data to WebSocket server.
             * If value of data parameter is not an object, it is put into a `{message: data}` object.
             * @param {String}    event  Event name
             * @param {Object|*}  data   Data to send
             */

        }, {
            key: 'emit',
            value: function emit(event) {
                var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {
                    data = { message: data };
                }

                var frame = JSON.stringify({
                    event: event,
                    data: data
                });

                this.websocket.send(frame);
            }

            /**
             * Return an URL built from `this.options`.
             * Path is auto-prefixed by "/ws".
             * @returns {String}
             */

        }, {
            key: 'build_url',
            value: function build_url() {
                var protocol = this.options.secure ? 'wss' : 'ws';

                return protocol + '://' + this.options.host + ':' + this.options.port + '/ws' + this.path;
            }
        }]);

        return TornadoWebSocket;
    }();

    TornadoWebSocket.Module = function () {
        function _class() {
            var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            _classCallCheck(this, _class);

            if (this.constructor === TornadoWebSocket.Module) {
                throw new TypeError('Abstract class « TornadoWebSocket.Module » can not be instantiated directly.');
            }

            this.name = '' + name;
        }

        /**
         * @param websocket
         */


        _createClass(_class, [{
            key: 'bindWebsocket',
            value: function bindWebsocket(websocket) {
                if (!(websocket instanceof TornadoWebSocket)) {
                    throw new TypeError('Parameter « websocket » should be an instance of TornadoWebSocket, got ' + (typeof websocket === 'undefined' ? 'undefined' : _typeof(websocket)) + ' instead.');
                }

                this.websocket = websocket;
            }

            /**
             * Shortcut for `TornadoWebSocket.on` method, with prefixed event support.
             *
             * @param {String}    event     Event name prefixed by `TornadoWebSocketModule.name`.
             * @param {Function}  callback  Function to execute when event `event` is received.
             * @see http://django-tornado-websockets.readthedocs.io/en/latest/usage.html#TornadoWebSocket.on
             */

        }, {
            key: 'on',
            value: function on(event, callback) {
                return this.websocket.on(this.name + event, callback);
            }

            /**
             * Shortcut for `TornadoWebSocket.emit` method, with prefixed event support.
             *
             * @param {String} event - Event name prefixed by `TornadoWebSocketModule.name`.
             * @param {Object|*} data - Data to send.
             * @see http://django-tornado-websockets.readthedocs.io/en/latest/usage.html#TornadoWebSocket.emit
             */

        }, {
            key: 'emit',
            value: function emit(event) {
                var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                return this.websocket.emit(this.name + event, data);
            }
        }]);

        return _class;
    }();

    return TornadoWebSocket;
});