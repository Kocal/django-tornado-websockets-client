define(window.__env__['dependencies'], function (TornadoWebSocket, ProgressBarModule) {

    fdescribe('ProgressBarModule', function () {
        it('should be defined', function () {
            expect(ProgressBarModule).toBeDefined()
        })

        describe('constructor()', function () {
            it('should correctly prefixed', function () {
                var progressbar = new ProgressBarModule('foo')

                expect(progressbar.name).toBe('module_progressbar_foo_')
            })
        })

        xdescribe('set_engine()', function () {
            it('should throw an error because it expected an instance of ProgressBar.EngineInterface', function () {
                var progressbar = new ProgressBarModule('foo')

                expect(function () {
                    progressbar.set_engine('not an engine')
                }).toThrow(new TypeError('Parameter « engine » should be an instance of ProgressBarModuleEngine.'))
            })

            it('should correctly call engine\'s oninit/onupdate', function () {
                var tws = new TornadoWebSocket('foo')
                var progressbar = new ProgressBarModule('foo')
                var bootstrapEngine = new ProgressBarModule.EngineBootstrap(document.body, {})

                spyOn(tws, 'on').and.callThrough()
                spyOn(progressbar, 'on').and.callThrough()
                spyOn(bootstrapEngine, 'render').and.callThrough()
                spyOn(bootstrapEngine, 'on_init').and.callThrough()
                spyOn(bootstrapEngine, 'on_update').and.callThrough()

                progressbar.bind_websocket(tws)
                progressbar.set_engine(bootstrapEngine)

                expect(progressbar.engine).toBe(bootstrapEngine)
                expect(progressbar.on).toHaveBeenCalledWith('init', jasmine.any(Function))
                expect(progressbar.on).toHaveBeenCalledWith('update', jasmine.any(Function))
                expect(tws.on).toHaveBeenCalledWith('module_progressbar_foo_init', jasmine.any(Function))
                expect(tws.on).toHaveBeenCalledWith('module_progressbar_foo_update', jasmine.any(Function))
                expect(bootstrapEngine.render).toHaveBeenCalled()

                tws.events['module_progressbar_foo_init']({})
                tws.events['module_progressbar_foo_update']({})

                expect(bootstrapEngine.on_init).toHaveBeenCalledWith({})
                expect(bootstrapEngine.on_update).toHaveBeenCalledWith({})
            })
        })

        describe('EngineInterface', function () {
            describe('constructor()', function () {

            })

            describe('render()', function () {

            })

            describe('on_init()', function () {

            })

            describe('on_update()', function () {
                
            })


        })
    })
})