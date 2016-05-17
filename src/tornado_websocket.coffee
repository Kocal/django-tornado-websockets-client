tws = (path, options) ->
    new TornadoWebSocket path, options

class TornadoWebSocket
    ###*
    # Initialize a new WebSocket object with given options.
    # @param {string}  path            Url of a django-tornado-websockets application
    # @param {Object}  options         Object options
    # @param {string}  options.host    Host used for connection
    # @param {number}  options.port    Port user for connection
    # @param {boolean} options.secure  Using 'ws' or 'wss' protocol
    ###
    constructor: (path, options) ->
        if this not instanceof TornadoWebSocket
            return new TornadoWebSocket path, options

        if path is undefined
            throw new ReferenceError 'You must pass "path" parameter during "TornadoWebSocket" instantiation.'

        ###*
        # WebSocket instance
        # @type {WebSocket}
        ###
        @websocket = null

        ###*
        # Configuration values
        # @type {object}
        # @private
        ###
        @options = _.merge {
            host: 'localhost',
            port: 8000,
            secure: false
        }, options

        ###*
        # Path of a django-tornado-websockets application
        # @type {string}
        # @private
        ###
        @path = path.trim()
        @path = if @path[0] isnt '/' then '/' + @path else @path

        ###*
        # Registered events
        # @type {object}
        # @private
        ###
        @events = {}

        @connect()

    connect: ->
        @websocket = null
