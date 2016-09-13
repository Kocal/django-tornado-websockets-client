define(window.__env__['dependencies'], function (TornadoWebSocket) {
    describe('TornadoWebSocket.Module', function () {
        // From Babel
        function _inherits(subClass, superClass) {
            if (typeof superClass !== 'function' && superClass !== null) {
                throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });
            if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
        }

        var MyModule = (function (Module) {  // sub class of TornadoWebSocket.Module
            _inherits(MyModule, Module)

            function MyModule(prefix) {
                Object.getPrototypeOf(MyModule).call(this, prefix)
            }

            return MyModule
        })(TornadoWebSocket.Module)

        describe('constructor()', function () {
            it('should not be instantiated directly', function () {
                expect(function () {
                    new TornadoWebSocket.Module()
                }).toThrow(new TypeError('Abstract class « TornadoWebSocket.Module » can not be instantiated directly.'))
            })

            it('should be inherited by a sub class', function () {
                var myModule = new MyModule('my_module')

                expect(myModule.name).toBe('module_my_module')
            })
        })

        describe('bind_websocket()', function () {
            it('should fails because no TornadoWebSocket insance', function () {
                var myModule = new MyModule('my_module_')

                expect(function () {
                    myModule.bind_websocket('TOP KEK')
                }).toThrow(new TypeError('Parameter « websocket » should be an instance of TornadoWebSocket.'))
            })

            it('should not fails with TornadoWebSocket insance', function () {
                var tws = new TornadoWebSocket('path')
                var myModule = new MyModule('my_module_')

                expect(function () {
                    myModule.bind_websocket(tws)
                }).not.toThrow(new TypeError('Parameter « websocket » should be an instance of TornadoWebSocket.'))

                expect(myModule.websocket).toEqual(tws)
            })
        })

        describe('on()', function () {
            it('should call tws.on() with a prefix', function () {
                var tws = new TornadoWebSocket('path')
                var myModule = new MyModule('my_module_')

                spyOn(tws, 'on')

                myModule.bind_websocket(tws)
                myModule.on('my_event', function () {})

                expect(tws.on).toHaveBeenCalledWith('module_my_module_my_event', jasmine.any(Function))
            })
        })

        describe('emit()', function () {
            it('should call tws.emit() with a prefix', function () {
                var tws = new TornadoWebSocket('path')
                var myModule = new MyModule('my_module_')

                spyOn(tws, 'emit')

                myModule.bind_websocket(tws)
                myModule.emit('my_event')

                expect(tws.emit).toHaveBeenCalledWith('module_my_module_my_event', {})
            })
        })
    })
})