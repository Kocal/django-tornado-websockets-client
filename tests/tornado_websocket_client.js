/**
 * Created by kocal on 19/05/16.
 */

describe('TornadoWebSocketClient I/O', function () {

    it('should connect to a websocket echo server`', function (done) {
        var ws = new TornadoWebSocket('/echo', { host: 'kocal.fr' });
        var messages = ['Message #1', 'Message #2', 'Message #3'];
        var cursor = 0;

        ws.on('open', function (socket) {

            socket.emit('message', {
                message: messages[cursor]
            });

            socket.on('message', function (data) {
                expect(data).toEqual(jasmine.any(Object));
                expect(data.message).toBe(messages[cursor++]);

                if (cursor < messages.length) {
                    socket.emit('message', {
                        message: messages[cursor]
                    });
                } else {
                    done();
                }
            });
        });

        ws.connect();
    });

})
