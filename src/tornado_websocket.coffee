tws = (path, options) ->
    new TornadoWebSocket path, options

class TornadoWebSocket
    ###*
    # Initialize a new WebSocket object with given options.
    # @param {String}  path            Url of a django-tornado-websockets application
    # @param {Object}  options         Object options
    # @param {String}  options.host    Host used for connection
    # @param {Number}  options.port    Port user for connection
    # @param {Boolean} options.secure  Using 'ws' or 'wss' protocol
    ###
    constructor: (path, options) ->
        if this not instanceof TornadoWebSocket
            return new TornadoWebSocket path, options

        if path is undefined
            throw new ReferenceError "You must pass 'path' parameter during 'TornadoWebSocket' instantiation."

        ###*
        # WebSocket instance
        # @type {WebSocket}
        ###
        @websocket = null

        ###*
        # Configuration values
        # @type {Object}
        # @private
        ###
        @options = _.merge {
            host: 'localhost',
            port: 8000,
            secure: false
        }, options

        ###*
        # Path of a django-tornado-websockets application
        # @type {String}
        # @private
        ###
        @path = path.trim()
        @path = if @path[0] isnt '/' then '/' + @path else @path

        ###*
        # Generated URL by path and configuration values
        # @type {String}
        # @private
        ###
        @url = @buildUrl()

        ###*
        # Reserved events (open, close, error and message)
        # @type {Object}
        # @private
        ###
        @reservedEvents =
            open: (socket, event) -> console.info 'New connection'
            close: (reason, event) -> console.info 'Connection closed', reason, event
            error: (event) -> console.info 'Got an error', event
            message: (event) -> console.info 'Got a message'

        ###*
        # Events defined by the user
        # @type {Object}
        # @private
        ###
        @userEvents = {}

    connect: ->
        @websocket = new WebSocket @url
        @client = new TornadoWebSocketClient @

        @websocket.onopen = (event) =>
            @reservedEvents.open @client, event

        @websocket.onclose = (event) =>
            @reservedEvents.close event.reason, event

        @websocket.onerror = (event) =>
            @reservedEvents.error event

        @websocket.onmessage = (event) =>
            @client.onmessage event

        return @

    ###*
    # Bind a function to an event.
    # @param {String}    event     Event name
    # @param {Function}  callback  Function to execute when event `event` is sent by the server
    ###
    on: (event, callback) ->
        if typeof callback isnt 'function'
            throw new TypeError "You must pass a function for 'callback' parameter."

        @reservedEvents[event] = callback
        return

    emit: (event, data={}, broadcast=true) ->
        data = JSON.stringify
            event: event,
            data: data

        @websocket.send data

    ###*
    # Return an URL built from `this.options`.
    # Path is auto-prefixed by "/ws".
    # @returns {String}
    ###
    buildUrl: ->
        protocol = if @options.secure then 'wss' else 'ws'

        return "#{protocol}://#{@options.host}:#{@options.port}/ws#{@path}"
