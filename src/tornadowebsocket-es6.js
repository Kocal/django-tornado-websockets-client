(function (root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define([], factory)
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory()
    } else {
        root.TornadoWebSocket = factory()
    }
}(this, function () {
    'use strict'

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
    class TornadoWebSocket {

        /**
         * Initialize a new WebSocket object with given options.
         *
         * @param {String}   path            Url of a django-tornado-websockets application
         * @param {Object}   options         Object options
         * @param {String}   options.host    Host used for connection
         * @param {Number}   options.port    Port user for connection
         * @param {Boolean}  options.secure  Using 'ws' or 'wss' protocol
         */
        constructor(path, options = {}) {
            if (path === undefined) {
                throw new ReferenceError('You must pass « path » parameter during instantiation.')
            }

            /**
             * WebSocket instance
             * @type {WebSocket}
             */
            this.websocket = null

            /**
             * Configuration values
             * @type {Object}
             * @private
             */
            this.options = Object.assign({}, {
                host: location.hostname || 'localhost',
                port: 8000,
                secure: false,
            }, options)

            /**
             * Path of a django-tornado-websockets application
             * @type {String}
             * @private
             */
            this.path = path.trim()
            this.path = this.path[0] === '/' ? this.path : '/' + this.path

            /**
             * Generated URL by path and configuration values
             * @type {String}
             * @private
             */
            this.url = this.build_url()

            /**
             * Events defined by the user
             * @type {Object}
             * @private
             */
            this.events = {}

            this.connect()
        }

        /**
         * Return an URL built from `this.options`.
         * Path is auto-prefixed by "/ws".
         * @returns {String}
         */
        build_url() {
            let protocol = this.options.secure ? 'wss' : 'ws'

            return `${protocol}://${this.options.host}:${this.options.port}/ws${this.path}`
        }

        /**
         * Initialize a new WebSocket connection and bind 'open', 'close', 'error' and 'message' events.
         */
        connect() {
            this.websocket = new WebSocket(this.url)

            this.websocket.onopen = event => {
                console.info('TornadoWebSocket: New connection', event)
            }
            this.websocket.onclose = event => {
                console.info('TornadoWebSocket: Connection closed', event)
            }
            this.websocket.onerror = event => {
                console.error('TornadoWebSocket: Error', event)
            }

            this.websocket.onmessage = event => {
                // Throwing locally a based-Error message in the next try/catch block saves me to write multiple times
                // `console.warn` and `return`.
                // Instead, I throw a based-Error message and use console.warn in the catch block.
                try {
                    let data = JSON.parse(event.data)
                    let passed_event, passed_data, callback

                    if ((passed_event = data.event) === void 0) {
                        throw new ReferenceError('Can not get passed event from JSON data.')
                    }

                    if ((passed_data = data.data) === void 0) {
                        throw new ReferenceError('Can not get passed data from JSON data.')
                    }

                    if ((callback = this.events[passed_event]) === void 0) {
                        throw new ReferenceError(`Event « ${passed_event} » is not binded.`)
                    }

                    callback(passed_data)
                } catch (e) {
                    if (e instanceof SyntaxError) {  // JSON.parse()
                        console.warn('TornadoWebSocket: Can not parse invalid JSON.')
                    } else {
                        console.warn(`TornadoWebSocket: ${e.message}`)
                    }
                }
            }
        }

        /**
         * Bind a function to an event.
         * @param {String}    event     Event name
         * @param {Function}  callback  Function to execute when event `event` is sent by the server
         */
        on(event, callback) {
            if (typeof callback !== 'function') {
                throw new TypeError('You must pass a function for « callback » parameter.')
            }

            if (['open', 'close', 'error'].includes(event)) {
                this.websocket['on' + event] = callback
            } else {
                this.events[event] = callback
            }
        }

        /**
         * Emit a couple event/data to WebSocket server.
         * If value of data parameter is not an object, it is put into a `{message: data}` object.
         * @param {String}    event  Event name
         * @param {Object|*}  data   Data to send
         */
        emit(event, data = {}) {
            if (typeof data !== 'object') {
                data = {message: data}
            }

            let frame = JSON.stringify({
                event: event,
                data: data
            })

            this.websocket.send(frame)
        }
    }

    TornadoWebSocket.Module = class {
        constructor(prefix = '') {

            if (this.constructor === TornadoWebSocket.Module) {
                throw new TypeError('Abstract class « TornadoWebSocket.Module » can not be instantiated directly.')
            }

            this.name = '' + prefix
        }

        /**
         * @param websocket
         */
        bind_websocket(websocket) {
            if (!(websocket instanceof TornadoWebSocket)) {
                throw new TypeError('Parameter « websocket » should be an instance of TornadoWebSocket.')
            }

            this.websocket = websocket
        }

        /**
         * Shortcut for `TornadoWebSocket.on` method, with prefixed event support.
         *
         * @param {String}    event     Event name prefixed by `TornadoWebSocketModule.name`.
         * @param {Function}  callback  Function to execute when event `event` is received.
         * @see http://django-tornado-websockets.readthedocs.io/en/latest/usage.html#TornadoWebSocket.on
         */
        on(event, callback) {
            return this.websocket.on(this.name + event, callback)
        }

        /**
         * Shortcut for `TornadoWebSocket.emit` method, with prefixed event support.
         *
         * @param {String} event - Event name prefixed by `TornadoWebSocketModule.name`.
         * @param {Object|*} data - Data to send.
         * @see http://django-tornado-websockets.readthedocs.io/en/latest/usage.html#TornadoWebSocket.emit
         */

        emit(event, data = {}) {
            return this.websocket.emit(this.name + event, data)
        }
    }

    return TornadoWebSocket
}))