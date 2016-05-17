tws = (url, options) ->
    new TornadoWebSocket url, options

class TornadoWebSocket
    ###*
    # Initialize a new WebSocket object with given options.
    # @param {string}   url             Url of a django-tornado-websockets application
    # @param {Object}   options         Object options
    # @param {string}   options.host    Host used for connection
    # @param {integer}  options.port    Port user for connection
    # @param {bool}     options.secure  Using 'ws' or 'wss' protocol
    ###
    constructor: (url, options) ->

        if @ not instanceof TornadoWebSocket
            return new TornadoWebSocket url, options

        throw new ReferenceError('You must pass "url" parameter during "TornadoWebSocket" instantiation.') if !url?

        @url = url

        @options = _.merge {
            host: 'localhost',
            port: 8000,
            secure: false
        }, options

        return
