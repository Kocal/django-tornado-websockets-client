/**
 * Created by kocal on 17/05/16.
 */

describe('TornadoWebSocket instances shortcuts', function () {

    it('`tws()` should be an instance of TornadoWebSocket', function () {
        var ws = tws('/foo');
        expect(ws instanceof TornadoWebSocket).toBeTruthy()
    });

    it('`TornadoWebSocket()` should be an instance of TornadoWebSocket', function () {
        var ws = TornadoWebSocket('/foo');
        expect(ws instanceof TornadoWebSocket).toBeTruthy()
    });

    // In case of :^)
    it('`new TornadoWebSocket()` should be an instance of TornadoWebSocket', function () {
        var ws = new TornadoWebSocket('/foo');
        expect(ws instanceof TornadoWebSocket).toBeTruthy()
    });

});

describe('`TornadoWebSocket::constructor(path, options)', function () {

    it('should raise a ReferenceError exception because there is no "path" parameter', function () {
        expect(function () {
            return new TornadoWebSocket
        }).toThrowError(ReferenceError, "You must pass 'path' parameter during 'TornadoWebSocket' instantiation.")
    });

    it('should be using default options', function () {
        var ws = new TornadoWebSocket('my_app');

        expect(ws.options).toEqual({
            host: 'localhost',
            port: 8000,
            secure: false
        });
    });

    it('should be merging options', function () {
        var ws = new TornadoWebSocket('my_app', {
            host: 'my.host.fr',
            port: 8080
        });

        expect(ws.options).toEqual({
            host: 'my.host.fr',
            port: 8080,
            secure: false
        });
    });

    it('should be overide options', function () {
        var ws = new TornadoWebSocket('my_app', {
            host: 'my.host.fr',
            port: 8080,
            secure: true
        });

        expect(ws.options).toEqual({
            host: 'my.host.fr',
            port: 8080,
            secure: true
        });
    });

    it('should suffix path by "/"', function () {
        var ws = new TornadoWebSocket('my_app');
        expect(ws.path).toBe('/my_app');
        expect(ws.path).not.toBe('my_app')
    });

    it('should not suffix path by "/"', function () {
        var ws = new TornadoWebSocket('/my_app');
        expect(ws.path).toBe('/my_app');
        expect(ws.path).not.toBe('//my_app')
    });

});

describe('`TornadoWebSocket::buildUrl()`', function () {

    it('using default options with suffixed path', function () {
        var ws = new TornadoWebSocket('/my_app');

        expect(ws.buildUrl(), 'ws://localhost:8000/ws/my_app')
    });

    it('using default options with not suffixed path', function () {
        var ws = new TornadoWebSocket('my_app');

        expect(ws.buildUrl(), 'ws://localhost:8000/ws/my_app')
    });

    it('using secure websocket connection', function () {
        var ws = new TornadoWebSocket('/my_app', {
            secure: true
        });

        expect(ws.buildUrl(), 'wss://localhost:8000/ws/my_app')
    });

    it('using custom host and port', function () {
        var ws = new TornadoWebSocket('/my_app', {
            host: 'my_host.fr',
            port: 8080
        });

        expect(ws.buildUrl(), 'ws://my_host.fr:8080/ws/my_app')
    });

});

describe('`TornadoWebSocket::on(event, cb)`', function () {

    beforeEach(function () {
        spyOn(console, 'info');
        spyOn(console, 'warn');
        spyOn(console, 'error');
        spyOn(console, 'log');
    });

    it('should returns defaults callbacks', function () {
        var ws = new TornadoWebSocket('/my_app');

        expect(ws.reservedEvents.open).toEqual(jasmine.any(Function));
        ws.reservedEvents.open();
        expect(console.info).toHaveBeenCalled();

        expect(ws.reservedEvents.close).toEqual(jasmine.any(Function));
        ws.reservedEvents.close();
        expect(console.info).toHaveBeenCalled();

        expect(ws.reservedEvents.error).toEqual(jasmine.any(Function));
        ws.reservedEvents.error();
        expect(console.info).toHaveBeenCalled();
    });

    it('should returns new callbacks', function () {
        var ws = new TornadoWebSocket('/my_app');

        ws.on('open', function (socket, event) {
            console.log('New connection');
        });

        ws.on('close', function (reason, event) {
            console.log('Closed connection')
        });

        ws.on('error', function (event) {
            console.log('Got an error');
        });

        expect(ws.reservedEvents.open).toEqual(jasmine.any(Function));
        ws.reservedEvents.open();
        expect(console.log).toHaveBeenCalled();

        expect(ws.reservedEvents.close).toEqual(jasmine.any(Function));
        ws.reservedEvents.close();
        expect(console.log).toHaveBeenCalled();

        expect(ws.reservedEvents.error).toEqual(jasmine.any(Function));
        ws.reservedEvents.error();
        expect(console.log).toHaveBeenCalled();
    });

});

describe('`TornadoWebSocket::connect()`', function () {

    it('should connect to server', function (done) {
        var ws = new TornadoWebSocket('/my_chat', {
            host: 'kocal.fr'
        });

        ws.on('open', function (socket, event) {
            expect(socket).toEqual(jasmine.any(TornadoWebSocketClient));
            expect(event).toEqual(jasmine.any(Event));
            expect(event.type).toBe('open');
            done();
        });

        ws.connect();
    });

    it('should connect to server and wait close connection', function (done) {
        var ws = new TornadoWebSocket('/my_chat', {
            host: 'kocal.fr'
        });

        ws.on('open', function (socket, event) {
            expect(socket).toEqual(jasmine.any(TornadoWebSocketClient));
            ws.websocket.close();
        });

        ws.on('close', function (reason, event) {
            expect(reason).toEqual(jasmine.any(String));
            expect(reason).toBe(event.reason);
            expect(event).toEqual(jasmine.any(CloseEvent));
            expect(event.type).toBe('close');
            done();
        });

        ws.connect();
    });

    it('should connect to a websocker echo server`', function (done) {

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
});
