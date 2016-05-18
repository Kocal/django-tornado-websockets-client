
class TornadoWebSocketClient

    constructor: (websocket) ->
        if websocket not instanceof TornadoWebSocket
            throw new Error "Expected TornadoWebSocket instance, got '#{websocket}'"

        @websocket = websocket

    on: (event, callback) ->
        console.log(event, callback)

    emit: (event, data) ->
        console.log(event, data)
        
