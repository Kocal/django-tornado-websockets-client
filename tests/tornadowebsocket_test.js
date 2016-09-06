define(window.__env__['dependencies'], function (TornadoWebSocket) {

    describe('TornadoWebSocket', function () {
        it('should be defined', function () {
            expect(TornadoWebSocket).toBeDefined()
        })

        describe('constructor()', function () {
            it('should raise a ReferenceError', function () {
                expect(function () {
                    new TornadoWebSocket()
                }).toThrow(new ReferenceError('You must pass « path » parameter during instantiation.'))
            })

            it('should merge user options with default options', function () {
                var tws = new TornadoWebSocket('path', {
                    port: 1234,
                    secure: true
                })

                expect(tws.options).toEqual({
                    host: 'localhost',
                    port: 1234,
                    secure: true
                })
            })

            it('should prefix path with « / »', function () {
                var tws = new TornadoWebSocket('path')

                expect(tws.path).toEqual('/path')
                expect(tws.path).not.toEqual('path')
            })

            it('should not prefix path with « / »', function () {
                var tws = new TornadoWebSocket('/path')

                expect(tws.path).toEqual('/path')
                expect(tws.path).not.toEqual('//path')
            })
        })

        describe('build_url()', function () {
            it('should build correctly the url without secure', function () {
                var tws = new TornadoWebSocket('path')

                expect(tws.url).toEqual(tws.build_url())
                expect(tws.url).toEqual('ws://localhost:8000/ws/path')
            })

            it('should build correctly the url with secure', function () {
                var tws = new TornadoWebSocket('path', {secure: true})

                expect(tws.url).toEqual(tws.build_url())
                expect(tws.url).toEqual('wss://localhost:8000/ws/path')
            })
        })

        describe('connect()', function () {
            it('should correctly bind events', function () {
                var tws = new TornadoWebSocket('path')

                expect(tws.websocket).toEqual(jasmine.any(WebSocket))
                expect(tws.websocket.onopen).toEqual(jasmine.any(Function))
                expect(tws.websocket.onmessage).toEqual(jasmine.any(Function))
                expect(tws.websocket.onerror).toEqual(jasmine.any(Function))
                expect(tws.websocket.onclose).toEqual(jasmine.any(Function))
            })

            it('should call onopen() on an existing websocket server', function (done) {
                var tws = new TornadoWebSocket('/echo', {host: 'kocal.fr'}) // my server

                spyOn(tws.websocket, 'onopen').and.callThrough()
                spyOn(console, 'info').and.callThrough()

                setTimeout(function () {
                    expect(tws.websocket.onopen).toHaveBeenCalled()
                    expect(console.info).toHaveBeenCalledWith('TornadoWebSocket: New connection', jasmine.any(Event))

                    done()
                }, 4500)
            })

            it('should call onerror() and onclose() on a non existing websocket server', function (done) {
                var tws = new TornadoWebSocket('path')

                spyOn(tws.websocket, 'onerror').and.callThrough()
                spyOn(tws.websocket, 'onclose').and.callThrough()
                spyOn(console, 'error').and.callThrough()
                spyOn(console, 'info').and.callThrough()

                setTimeout(function () {
                    expect(tws.websocket.onerror).toHaveBeenCalled()
                    expect(console.error).toHaveBeenCalledWith('TornadoWebSocket: Error', jasmine.any(Event))

                    expect(tws.websocket.onclose).toHaveBeenCalled()
                    expect(console.info).toHaveBeenCalledWith('TornadoWebSocket: Connection closed', jasmine.any(CloseEvent))

                    done()
                }, 4500)
            })

            describe('test onmessage()', function () {

                beforeEach(function () {
                    spyOn(console, 'log')
                    spyOn(console, 'warn')
                })

                it('should warn about invalid JSON', function () {
                    var tws = new TornadoWebSocket('path')

                    tws.websocket.onmessage('abcdef')
                    expect(console.warn).toHaveBeenCalledWith('TornadoWebSocket: Can not parse invalid JSON.')
                })

                it('should warn because there is no event in the JSON', function () {
                    var tws = new TornadoWebSocket('path')

                    tws.websocket.onmessage(new MessageEvent('message', {
                        data: JSON.stringify({'key': 'data'})
                    }))
                    expect(console.warn).toHaveBeenCalledWith('TornadoWebSocket: Can not get passed event from JSON data.')
                })

                it('should warn because there is no event in the JSON', function () {
                    var tws = new TornadoWebSocket('path')

                    tws.websocket.onmessage(new MessageEvent('message', {
                        data: JSON.stringify({'event': 'my_event'})
                    }))
                    expect(console.warn).toHaveBeenCalledWith('TornadoWebSocket: Can not get passed data from JSON data.')
                })

                it('should warn because event in the JSON is not binded', function () {
                    var tws = new TornadoWebSocket('path')

                    tws.websocket.onmessage(new MessageEvent('message', {
                        data: JSON.stringify({
                            'event': 'my_event',
                            'data': {}
                        })
                    }))
                    expect(console.warn).toHaveBeenCalledWith('TornadoWebSocket: Event « my_event » is not binded.')
                })

                it('should call bound event', function () {
                    var tws = new TornadoWebSocket('path')

                    // We are testing tws.websocket.onmessage(), not tws.on()
                    tws.events.new_message = function (message) {
                        console.log('New message from ' + message.user.nickname + ': « ' + message.content + ' ».')
                    }

                    tws.websocket.onmessage(new MessageEvent('message', {
                        data: JSON.stringify({
                            'event': 'new_message',
                            'data': {
                                'content': 'My first message',
                                'user': {
                                    'nickname': 'Kocal'
                                }
                            }
                        })
                    }))

                    expect(console.log).toHaveBeenCalledWith('New message from Kocal: « My first message ».')
                })
            })
        })

        describe('on()', function () {
            it('should fails when callback is not a function', function () {
                var tws = new TornadoWebSocket('path')

                expect(function () {
                    tws.on('my_first_event', 'not a function')
                }).toThrow(new TypeError('You must pass a function for « callback » parameter.'))
            })

            it('should bind « classic » events to internal events dictionary', function () {
                var tws = new TornadoWebSocket('path')

                expect(tws.events['my_event']).toBeUndefined()

                tws.on('my_event', function () {})

                expect(tws.events['my_event']).toEqual(jasmine.any(Function))
            })

            it('should bind « special » events to websocket instance', function () {
                var tws = new TornadoWebSocket('path')

                tws.websocket.onopen = null
                tws.websocket.onerror = null
                tws.websocket.onclose = null

                expect(tws.websocket.onopen).toBeNull()
                expect(tws.websocket.onerror).toBeNull()
                expect(tws.websocket.onclose).toBeNull()

                tws.on('open', function () {})
                tws.on('error', function () {})
                tws.on('close', function () {})

                expect(tws.websocket.onopen).toEqual(jasmine.any(Function))
                expect(tws.websocket.onerror).toEqual(jasmine.any(Function))
                expect(tws.websocket.onclose).toEqual(jasmine.any(Function))
            })
        })

        describe('emit()', function () {
            beforeEach(function () {
                spyOn(WebSocket.prototype, 'send')
            })

            it('should emit event without data', function (done) {
                var tws = new TornadoWebSocket('/echo', {'host': 'kocal.fr'})

                tws.on('open', function () {
                    tws.emit('my_event')
                    expect(tws.websocket.send).toHaveBeenCalledWith('{"event":"my_event","data":{}}')
                    done()
                })
            }, 3000)

            it('should emit event with data which is a dictionary', function (done) {
                var tws = new TornadoWebSocket('/echo', {'host': 'kocal.fr'})

                tws.on('open', function () {
                    tws.emit('my_event', {'id': 1})
                    expect(tws.websocket.send).toHaveBeenCalledWith('{"event":"my_event","data":{"id":1}}')
                    done()
                })
            }, 3000)

            it('should emit event with data which is not a dictionary, by converts it to a dict', function (done) {
                var tws = new TornadoWebSocket('/echo', {'host': 'kocal.fr'})

                tws.on('open', function () {
                    tws.emit('my_event', 'My message.')
                    expect(tws.websocket.send).toHaveBeenCalledWith('{"event":"my_event","data":{"message":"My message."}}')
                    done()
                })
            }, 3000)
        })
    })

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

                expect(myModule.name).toBe('my_module')
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

                expect(tws.on).toHaveBeenCalledWith('my_module_my_event', jasmine.any(Function))
            })
        })

        describe('emit()', function () {
            it('should call tws.emit() with a prefix', function () {
                var tws = new TornadoWebSocket('path')
                var myModule = new MyModule('my_module_')

                spyOn(tws, 'emit')

                myModule.bind_websocket(tws)
                myModule.emit('my_event')

                expect(tws.emit).toHaveBeenCalledWith('my_module_my_event', {})
            })
        })
    })
})