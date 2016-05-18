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
        # Registered events
        # @type {Object}
        # @private
        ###
        @events = {}

        @connect()

    connect: ->
        @websocket = null

    on: (event, callback) ->
        ###*
        # Bind a function to an event.
        # @param {String}    event     Event name
        # @param {Function}  callback  Function to execute when event `event` is sent by the server
        ###
        if typeof callback isnt 'function'
            throw new TypeError "You must pass a function for 'callback' parameter."

        if @events[event] isnt undefined
            console.warn "Event '#{event}' event is already binded."

        @events[event] = callback

    buildUrl: ->
        ###*
        # Return an URL built from `this.options`
        # @returns {String}
        ###
        protocol = if @options.secure then 'wss' else 'ws'

        return "#{protocol}://#{@options.host}:#{@options.port}/ws#{@path}"
