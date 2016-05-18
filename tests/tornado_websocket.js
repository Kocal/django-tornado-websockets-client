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

    it('should bind an event', function () {
        var ws = new TornadoWebSocket('/my_app');
        var my_func = function () {
        };

        ws.on('my_event', my_func);

        expect(console.warn).not.toHaveBeenCalled();

        expect(Object.keys(ws.events)).toContain('my_event');
        expect(ws.events['my_event']).toEqual(jasmine.any(Function));
    });

    it('should bind two differents events', function () {
        var ws = new TornadoWebSocket('/my_app');
        var my_func = function () {
        };

        ws.on('my_event', my_func);
        ws.on('my_other_event', my_func);

        expect(console.warn).not.toHaveBeenCalled();

        expect(Object.keys(ws.events)).toContain('my_event');
        expect(ws.events['my_event']).toEqual(jasmine.any(Function));

        expect(Object.keys(ws.events)).toContain('my_other_event');
        expect(ws.events['my_other_event']).toEqual(jasmine.any(Function));
    });

    it('should bind two same events but call `console.warn`', function () {
        var ws = new TornadoWebSocket('/my_app');
        var my_func = function () {
        };

        ws.on('my_event', my_func);
        ws.on('my_event', my_func);

        expect(console.warn).toHaveBeenCalled();
        expect(Object.keys(ws.events).length).toEqual(1)

    });

    it('should raise TypeError exception if `callback` parameter is not a function', function () {
        var ws = new TornadoWebSocket('/my_app')

        expect(function () {
            ws.on('my_event', 5000);
        }).toThrowError(TypeError, "You must pass a function for 'callback' parameter.");

        expect(function () {
            ws.on('my_event', 'a string');
        }).toThrowError(TypeError, "You must pass a function for 'callback' parameter.");

        expect(function () {
            ws.on('my_event', { an: 'object' });
        }).toThrowError(TypeError, "You must pass a function for 'callback' parameter.");

        expect(function () {
            ws.on('my_event', function () {
            });

            expect(ws.events['my_event']).toEqual(jasmine.any(Function));
        }).not.toThrowError(TypeError);
    });

    it('should returns default callbacks', function () {
        var ws = new TornadoWebSocket('/my_app');

        expect(ws.getEvent('open')).toEqual(jasmine.any(Function));
        ws.getEvent('open')();
        expect(console.info).toHaveBeenCalled();

        expect(ws.getEvent('close')).toEqual(jasmine.any(Function));
        ws.getEvent('close')({});
        expect(console.info).toHaveBeenCalled();

        expect(ws.getEvent('error')).toEqual(jasmine.any(Function));
        ws.getEvent('error')({});
        expect(console.error).toHaveBeenCalled();

        expect(ws.getEvent('an_event')).toEqual(jasmine.any(Function));
        ws.getEvent('an_event')();
        expect(console.warn).toHaveBeenCalled();
    });

    it('should returns existing callbacks', function () {
        var ws = new TornadoWebSocket('/my_app');

        ws.on('open', function (event) {
            console.log('New connection');

            ws.on('my_event', function (event) {
                console.log('my_event');
            });
        });

        ws.on('close', function (event) {
            console.log('Closed connection')
        });

        ws.on('error', function (event) {
            console.log('Got error');
        });

        expect(ws.getEvent('open')).toEqual(jasmine.any(Function));
        ws.getEvent('open')();
        expect(console.log).toHaveBeenCalled();

        expect(ws.getEvent('close')).toEqual(jasmine.any(Function));
        ws.getEvent('close')();
        expect(console.log).toHaveBeenCalled();

        expect(ws.getEvent('error')).toEqual(jasmine.any(Function));
        ws.getEvent('error')();
        expect(console.log).toHaveBeenCalled();

        expect(ws.getEvent('my_event')).toEqual(jasmine.any(Function));
        ws.getEvent('my_event')();
        expect(console.log).toHaveBeenCalled();

        expect(ws.getEvent('an_event')).toEqual(jasmine.any(Function));
        ws.getEvent('an_event')();
        expect(console.warn).toHaveBeenCalled();
    });

});

describe('`TornadoWebSocket::connect()`', function () {

    it('should connect to server and receive "open" event', function (done) {
        var ws = new TornadoWebSocket('/my_chat');

        ws.on('open', function (evt) {
            done();
        });

        ws.connect();
    });

    it('should connect to server and trigger open and close event callback', function (done) {
        var ws = new TornadoWebSocket('/my_chat');

        ws.on('open', function (evt) {
            ws.websocket.close();
        });

        ws.on('close', function (evt) {
            done();
        });

        ws.connect();
    });

});
