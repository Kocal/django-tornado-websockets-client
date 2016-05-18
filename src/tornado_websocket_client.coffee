class TornadoWebSocketClient
    ###*
    # Initialize a new WebSocket client which handle I/O behavior of TornadoWebSocket.
    #
    ###
    constructor: (websocket) ->
        if websocket not instanceof TornadoWebSocket
            throw new Error "Expected TornadoWebSocket instance, got '#{websocket}'"

        @websocket = websocket

        @events = {}

    onmessage: (event) ->
        try
            data = JSON.parse event.data
        catch
            console.error "Can not parse invalid JSON."
            return

        passed_event = data.event
        passed_data = data.data

        console.log 'events', @events

        if passed_event is undefined or passed_data is undefined
            console.error 'Can not get passed event or passed data.'
            return

        callback = @events[passed_event]

        if callback is undefined
            console.error "There is no callback for '#{passed_event}' passed event."
            return

        callback passed_data

    on: (event, callback) ->
        @events[event] = callback

    emit: (event, data) ->
        @websocket.emit(event, data, false)

