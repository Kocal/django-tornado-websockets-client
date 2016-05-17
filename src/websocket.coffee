class WebSocket
    ###*
    # Initialize a new WebSocket object with given options.
    # @param {string}   url             Url of a django-tornado-websockets application
    # @param {Object}   options         Object options
    # @param {string}   options.host    Host used for connection
    # @param {integer}  options.port    Port user for connection
    # @param {bool}     options.secure  Using 'ws' or 'wss' protocol
    ###
    constructor: (url, options) ->

        throw new ReferenceError('You must pass "url" parameter during "WebSocket" instantiation') if !url?

        @url = url

        @options = _.merge {
            host: 'localhost',
            port: 8000,
            secure: false
        }, options

        return
