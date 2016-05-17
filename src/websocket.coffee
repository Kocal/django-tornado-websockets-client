class WebSocket
    ###*
    # Initialize a new WebSocket object with given options.
    # @param {object}   options         Object options
    # @param {string}   options.host    Host used for connection
    # @param {integer}  options.port    Port user for connection
    # @param {bool}     options.secure  Using ws or wss protocol
    ###
    constructor: (options) ->
        @options = _.merge {
            host: 'localhost',
            port: 8000,
            secure: false
        }, options

        return
