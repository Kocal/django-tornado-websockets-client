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

    connect: ->
        @websocket = new WebSocket @url

        @websocket.onopen = @getEvent 'open'
        @websocket.onclose = @getEvent 'close'
        @websocket.onerror = @getEvent 'error'

        @websocket.onmessage = (evt) ->
            console.log('message', evt)

        return @

    ###*
    # Bind a function to an event.
    # @param {String}    event     Event name
    # @param {Function}  callback  Function to execute when event `event` is sent by the server
    ###
    on: (event, callback) ->
        if typeof callback isnt 'function'
            throw new TypeError "You must pass a function for 'callback' parameter."

        if @events[event] isnt undefined
            console.warn "Event '#{event}' event is already binded."

        @events[event] = callback

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
    getEvent: (event_name, default_callback) ->
        if @events[event_name] isnt undefined
            return @events[event_name]

        switch event_name
            when 'open' then f = (event) ->
                console.info 'Open(): New connection:', event
            when 'close' then f = (event) ->
                console.info "Close(): [#{event.code}] #{event.reason}"
            when 'error' then f = (event) ->
                console.error 'Error(): ', event.data
            else
                f = ->
                    console.warn "Can not make a callback for event '#{event_name}'."

        return f
