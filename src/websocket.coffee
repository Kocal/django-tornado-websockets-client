class WebSocket
    constructor: (options) ->
        @options = _.merge {
            host: 'localhost',
            port: 8000,
            secure: false
        }, options

        return
