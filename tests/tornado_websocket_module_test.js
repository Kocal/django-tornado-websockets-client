define(['tornadowebsocket'], function (TornadoWebSocket) {

    describe('`TornadoWebSocket.Module`', function () {
        it('should be defined', function () {
            expect(TornadoWebSocket.Module).toBeDefined();
        });
    });

    describe('`TornadoWebSocket.Module::constructor(websocket, name)`', function () {
        it('should raise a TypeError because `websocket` is not a `TornadoWebSocket` instance', function () {
            expect(function () {
                new TornadoWebSocket.Module("blabla");
            }).toThrow(
                new TypeError('Parameter « websocket » should be an instance of TornadoWebSocket, got string instead.')
            )
        });

        it('should cast `name` to string', function () {
            var ws = new TornadoWebSocket('foo');
            var twsm = new TornadoWebSocket.Module(ws, 123);

            expect(twsm.name).toEqual("123");
        });
    });

    describe('`TornadoWebSocket.Module::on(event, callback)`', function () {
        beforeAll(function () {
            spyOn(TornadoWebSocket.prototype, 'on');
        });

        it('should call `TornadoWebSocket.on(event, callback)', function () {
            var ws = new TornadoWebSocket('foo');
            var twsm = new TornadoWebSocket.Module(ws);

            twsm.on('event', function () {

            });

            expect(TornadoWebSocket.prototype.on).toHaveBeenCalledWith('event', jasmine.any(Function));
        });

        it('should call `TornadoWebSocket.on(event, callback) with name', function () {
            var ws = new TornadoWebSocket('foo');
            var twsm = new TornadoWebSocket.Module(ws, 'a_prefix_');

            twsm.on('event', function () {

            });

            expect(TornadoWebSocket.prototype.on).toHaveBeenCalledWith('a_prefix_event', jasmine.any(Function));
        });
    });

    describe('`TornadoWebSocket.Module::emit(event, data)`', function () {
        beforeAll(function () {
            spyOn(TornadoWebSocket.prototype, 'emit');
        });

        it('should call `TornadoWebSocket.emit(event, data)', function () {
            var ws = new TornadoWebSocket('foo');
            var twsm = new TornadoWebSocket.Module(ws);

            twsm.emit('event', {'key': 'value'});

            expect(TornadoWebSocket.prototype.emit).toHaveBeenCalledWith('event', {'key': 'value'});
        });

        it('should call `TornadoWebSocket.emit(event, data) with name', function () {
            var ws = new TornadoWebSocket('foo');
            var twsm = new TornadoWebSocket.Module(ws, 'a_prefix_');

            twsm.emit('event');

            expect(TornadoWebSocket.prototype.emit).toHaveBeenCalledWith('a_prefix_event', {});
        });
    });
})