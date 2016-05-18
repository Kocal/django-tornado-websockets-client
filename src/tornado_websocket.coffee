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
        # Reserved events (open, close, message and error)
        # @type {Object}
        # @private
        ###
        @reservedEvents = {}

        ###*
        # Events defined by the user
        # @type {Object}
        # @private
        ###
        @userEvents = {}

    connect: ->
        @websocket = new WebSocket @url

        @websocket.onopen = @getReservedEvent 'open'
        @websocket.onclose = @getReservedEvent 'close'
        @websocket.onerror = @getReservedEvent 'error'
        @websocket.onmessage = @getReservedEvent 'message'

        return @

    ###*
    # Bind a function to an event.
    # @param {String}    event     Event name
    # @param {Function}  callback  Function to execute when event `event` is sent by the server
    ###
    on: (event, callback) ->
        if typeof callback isnt 'function'
            throw new TypeError "You must pass a function for 'callback' parameter."

        if @reservedEvents[event] isnt undefined
            console.warn "Event '#{event}' event is already binded."

        @reservedEvents[event] = callback
        return

    ###*
    # Return an URL built from `this.options`.
    # Path is auto-prefixed by "/ws".
    # @returns {String}
    ###
    buildUrl: ->
        protocol = if @options.secure then 'wss' else 'ws'

        return "#{protocol}://#{@options.host}:#{@options.port}/ws#{@path}"

    ###*
    # @returns {Function}
    ###
    getReservedEvent: (event_name, default_callback) ->
        if @reservedEvents[event_name] isnt undefined
            return @reservedEvents[event_name]

        switch event_name
            when 'open' then f = (event) ->
                console.info 'Open(): New connection:', event
            when 'close' then f = (event) ->
                console.info "Close(): [#{event.code}] #{event.reason}"
            when 'error' then f = (event) ->
                console.error 'Error(): ', event.data
            when 'message' then f = (event) ->
                try
                    data = JSON.parse(event.data)
                    event = data.event
                    passed_data = data.data
                catch # invalid JSON or event/passed_data not found
                    throw new Error 'Use tornado_websocket.js with a websocket server which send a valid JSON.'

                console.log event, passed_data
                return

            else
                f = ->
                    console.warn "Can not make a callback for event '#{event_name}'."

        return f
