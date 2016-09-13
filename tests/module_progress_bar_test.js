define(window.__env__['dependencies'], function (TornadoWebSocket, ProgressBarModule) {

    describe('ProgressBarModule', function () {
        it('should be defined', function () {
            expect(ProgressBarModule).toBeDefined()
        })

        describe('constructor()', function () {
            it('should correctly prefixed', function () {
                var progressbar = new ProgressBarModule('foo')

                expect(progressbar.name).toBe('module_progressbar_foo_')
            })
        })

        describe('set_engine()', function () {
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
                spyOn(bootstrapEngine, 'on_update')
                spyOn(bootstrapEngine, 'update_progressbar_values')

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

        describe('getters and setters', function () {
            it('tests for min/max/current/progression', function () {
                var tws = new TornadoWebSocket('foo')
                var progressbar = new ProgressBarModule('foo')
                var bootstrapEngine = new ProgressBarModule.EngineBootstrap(document.body)

                progressbar.bind_websocket(tws)
                spyOn(bootstrapEngine, '_handle_progressbar_value')

                expect(progressbar.min).toEqual(void 0)
                expect(progressbar.max).toEqual(void 0)
                expect(progressbar.current).toEqual(void 0)
                expect(progressbar.progression).toEqual(void 0)

                // Should not change anything
                progressbar.min = 0
                progressbar.max = 200
                progressbar.current = 50

                expect(progressbar.min).toEqual(void 0)
                expect(progressbar.max).toEqual(void 0)
                expect(progressbar.current).toEqual(void 0)
                expect(progressbar.progression).toEqual(void 0)

                // Set the engine and set values
                progressbar.set_engine(bootstrapEngine)

                progressbar.min = 0
                progressbar.max = 200
                progressbar.current = 50

                expect(progressbar.min).toEqual(0)
                expect(progressbar.max).toEqual(200)
                expect(progressbar.current).toEqual(50)
                expect(progressbar.progression).toEqual(25)
            })
        })

        describe('EngineInterface', function () {
            describe('constructor()', function () {
                it('should fail because $container is undefined nor an HTMLElement', function () {
                    expect(function () {
                        new ProgressBarModule.EngineInterface()
                    }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))

                    expect(function () {
                        new ProgressBarModule.EngineInterface('foo')
                    }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))
                })

                it('should works because $container is an HTMLElement', function () {
                    expect(function () {
                        var engine = new ProgressBarModule.EngineInterface(document.body)

                        expect(engine.$container).toBe(document.body)
                        expect(engine.defaults).toEqual({})
                        expect(engine.options).toEqual({})
                    }).not.toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))
                })
            })

            describe('render()', function () {
                it('should correctly call _create_elements() and _render_element()', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    spyOn(engine, '_create_elements')
                    spyOn(engine, '_render_elements')

                    engine.render()

                    expect(engine._create_elements).toHaveBeenCalled()
                    expect(engine._render_elements).toHaveBeenCalled()
                })
            })

            describe('on_init()', function () {
                it('should use default values for the progress bar', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    spyOn(engine, 'on_update')
                    spyOn(engine, 'update_progressbar_values')

                    engine.on_init({'indeterminate': true})

                    expect(engine.update_progressbar_values).toHaveBeenCalledWith({
                        'min': 0,
                        'max': 100,
                        'current': 0,
                        'indeterminate': true
                    })
                    expect(engine.on_update).toHaveBeenCalledWith({'current': 0})
                })

                it('should use values sent by the server', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    spyOn(engine, 'on_update')
                    spyOn(engine, 'update_progressbar_values')

                    // @TODO change 'value' to 'current'
                    engine.on_init({'indeterminate': false, 'min': 0, 'value': 100, 'max': 250})

                    expect(engine.update_progressbar_values).toHaveBeenCalledWith({
                        'min': 0,
                        'max': 250,
                        'current': 100,
                        'indeterminate': false
                    })
                    expect(engine.on_update).toHaveBeenCalledWith({'current': 100})
                })
            })

            describe('on_update()', function () {
                it('should correctly call sub functions', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    spyOn(engine, 'update_progressbar_values')
                    spyOn(engine, '_update_progression')
                    spyOn(engine, '_update_label')

                    engine.on_update({'current': 50, 'label': '[50/100] Progression...'})

                    expect(engine.update_progressbar_values).toHaveBeenCalledWith({'current': 50})
                    expect(engine._update_progression).toHaveBeenCalled()
                    expect(engine._update_label).toHaveBeenCalledWith('[50/100] Progression...')
                })
            })

            describe('compute_progression()', function () {
                it('should correctly compute the progression', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    spyOn(engine, '_handle_progressbar_value')
                    spyOn(engine, 'on_update')

                    // @TODO change 'value' to 'current'
                    engine.on_init({'indeterminate': false, 'min': 0, 'value': 50, 'max': 100})
                    expect(engine.compute_progression()).toEqual(50)

                    engine.on_init({'indeterminate': false, 'min': 100, 'value': 150, 'max': 200})
                    expect(engine.compute_progression()).toEqual(50)

                    engine.on_init({'indeterminate': false, 'min': 0, 'value': 2, 'max': 10})
                    expect(engine.compute_progression()).toEqual(20)
                })
            })

            describe('format_progression()', function () {
                it('should fail because there is no defined template for the progression', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    expect(function () {
                        engine.format_progression(50)

                        // It depends of the browser, the 1st message is for Firefox, the 2nd is for Chrome/Opera (blink/webkit)
                    }).toThrowError(TypeError, /(progression_format is undefined)|(Cannot read property 'replace' of undefined)/)
                })

                it('should correctly format the progression with user defined template', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    engine.options.progression_format = 'Progression: {{progress}}%'
                    expect(engine.format_progression(50)).toEqual('Progression: 50%')

                    engine.options.progression_format = '{{ progress }}% {{ progress}}%'
                    expect(engine.format_progression(20)).toEqual('20% 20%')

                    engine.options.progression_format = '{{progress }}%'
                    expect(engine.format_progression(100)).toEqual('100%')
                })
            })

            describe('update_progressbar_values()', function () {
                it('should correctly works', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    spyOn(engine, '_handle_progressbar_value')

                    expect(engine.values.min).toBeUndefined()
                    expect(engine.values.max).toBeUndefined()
                    expect(engine.values.current).toBeUndefined()

                    engine.update_progressbar_values({'min': 0, 'max': 100, 'current': 50})

                    expect(engine.values.min).toEqual(0)
                    expect(engine._handle_progressbar_value).toHaveBeenCalledWith('min', 0)
                    expect(engine.values.max).toEqual(100)
                    expect(engine._handle_progressbar_value).toHaveBeenCalledWith('max', 100)
                    expect(engine.values.current).toEqual(50)
                    expect(engine._handle_progressbar_value).toHaveBeenCalledWith('current', 50)
                })
            })

            describe('_handle_progressbar_value()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    expect(function () {
                        engine._handle_progressbar_value('min', 0)
                    }).toThrow(new Error('Method « _handle_progressbar_value » should be implemented by the engine.'))
                })
            })

            describe('_create_elements()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    expect(function () {
                        engine._create_elements()
                    }).toThrow(new Error('Method « _create_elements » should be implemented by the engine.'))
                })
            })

            describe('_render_elements()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    expect(function () {
                        engine._render_elements()
                    }).toThrow(new Error('Method « _render_elements » should be implemented by the engine.'))
                })
            })

            describe('_update_label()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    expect(function () {
                        engine._update_label('My label')
                    }).toThrow(new Error('Method « _update_label » should be implemented by the engine.'))
                })
            })

            describe('_update_progression()', function () {
                it('should throw an error because it\'s not implemented', function () {
                    var engine = new ProgressBarModule.EngineInterface(document.body)

                    expect(function () {
                        engine._update_progression()
                    }).toThrow(new Error('Method « _update_progression » should be implemented by the engine.'))
                })
            })

            describe('EngineBootstrap', function () {
                describe('constructor()', function () {
                    it('should call EngineInterface::constructor() and fail because $container is undefined nor an HTMLElement', function () {
                        expect(function () {
                            new ProgressBarModule.EngineBootstrap()
                        }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))

                        expect(function () {
                            new ProgressBarModule.EngineBootstrap('foo')
                        }).toThrow(new TypeError('Parameter « $container » should be an instance of HTMLElement.'))
                    })

                    it('should assign « real » options with defaults options of the engine', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body)

                        expect(engineBootstrap.options).toEqual(engineBootstrap.defaults)
                        expect(engineBootstrap.options).toEqual({
                            'label_visible': true,
                            'label_classes': ['progressbar-label'],
                            'label_position': 'top',
                            'progressbar_context': 'info',
                            'progressbar_striped': false,
                            'progressbar_animated': false,
                            'progression_visible': true,
                            'progression_format': '{{progress}} %',
                        })
                    })

                    it('should merge « real » options, defaults options of the engine, with the user ones', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'label_visible': false,
                            'progression_format': 'Progression: {{progress}}%'
                        })

                        expect(engineBootstrap.options).not.toEqual(engineBootstrap.defaults)
                        expect(engineBootstrap.options).toEqual({
                            'label_visible': false,
                            'label_classes': ['progressbar-label'],
                            'label_position': 'top',
                            'progressbar_context': 'info',
                            'progressbar_striped': false,
                            'progressbar_animated': false,
                            'progression_visible': true,
                            'progression_format': 'Progression: {{progress}}%',
                        })
                    })
                })

                describe('render()', function () {
                    it('should correctly call _create_elements() and _render_element()', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body)

                        spyOn(engineBootstrap, '_create_elements')
                        spyOn(engineBootstrap, '_render_elements')

                        engineBootstrap.render()

                        expect(engineBootstrap._create_elements).toHaveBeenCalled()
                        expect(engineBootstrap._render_elements).toHaveBeenCalled()
                    })
                })

                describe('_update_progression()', function () {
                    it('should correctly works', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'progression_format': 'Progression: {{progress}}%'
                        })

                        engineBootstrap.render()
                        engineBootstrap.update_progressbar_values({'min': 0, 'max': 100, 'current': 50})
                        engineBootstrap._update_progression()

                        expect(engineBootstrap.$progression.textContent).toEqual('Progression: 50%')
                        expect(engineBootstrap.$progressbar.style.width).toEqual('50%')
                    })
                })

                describe('_update_progression()', function () {
                    it('should correctly works', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'progresssion_format': 'Progression: {{progress}}%'
                        })

                        engineBootstrap.render()
                        expect(engineBootstrap.$label.textContent).toEqual('')

                        engineBootstrap._update_label('foo')
                        expect(engineBootstrap.$label.textContent).toEqual('foo')

                        engineBootstrap._update_label()
                        expect(engineBootstrap.$label.textContent).toEqual('')
                    })
                })

                describe('_create_elements()', function () {
                    it('should create elements by following the default behavior', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body)

                        expect(engineBootstrap.$progress).toBeUndefined()
                        expect(engineBootstrap.$progression).toBeUndefined()
                        expect(engineBootstrap.$progressbar).toBeUndefined()
                        expect(engineBootstrap.$label).toBeUndefined()

                        engineBootstrap._create_elements()

                        expect(engineBootstrap.$progress).toEqual(jasmine.any(HTMLDivElement))
                        expect(engineBootstrap.$progress.classList).toContain('progress')

                        expect(engineBootstrap.$progressbar).toEqual(jasmine.any(HTMLDivElement))
                        expect(engineBootstrap.$progressbar.classList).toContain('progress-bar')
                        expect(engineBootstrap.$progressbar.getAttribute('role')).toEqual('progressbar')
                        expect(engineBootstrap.$progressbar.classList).toContain('progress-bar-info')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-success')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-warning')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-danger')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-striped')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('active')

                        expect(engineBootstrap.$progression).toEqual(jasmine.any(HTMLSpanElement))
                        expect(engineBootstrap.$progression).not.toContain('sr-only')

                        expect(engineBootstrap.$label).toEqual(jasmine.any(HTMLSpanElement))
                        // Can't compare a DOMTokenList ($label.classList) to an array with .toEqual method
                        expect(engineBootstrap.$label.className.split(' ')).toEqual(['progressbar-label'])
                        expect(engineBootstrap.$label.style.display).not.toEqual('none')
                    })

                    it('should not allow an invalid `progressbar_context`', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'progressbar_context': 'foo'
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-info')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-success')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-warning')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-danger')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-foo')
                    })

                    it('should « strip » the progressbar', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'progressbar_striped': true
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap.$progressbar.classList).toContain('progress-bar-striped')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('active')
                    })

                    it('should not animate the progressbar because it\'s not striped', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'progressbar_animated': true
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-striped')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('active')
                    })

                    it('should correctly animate the progressbar when it\'s not striped', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'progressbar_animated': true,
                            'progressbar_striped': true
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap.$progressbar.classList).toContain('progress-bar-striped')
                        expect(engineBootstrap.$progressbar.classList).toContain('active')
                    })

                    it('the $progression should be screen-reader visible only', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'progression_visible': false
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap.$progression.classList).toContain('sr-only')
                    })

                    it('the $label should not be visible ', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'label_visible': false
                        })

                        engineBootstrap._create_elements()

                        expect(engineBootstrap.$label.style.display).toEqual('none')
                    })
                })

                describe('_render_elements()', function () {
                    it('should render elements by following the default behavior', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body)

                        engineBootstrap._create_elements()
                        engineBootstrap._render_elements()

                        expect(engineBootstrap.$progression.parentNode).toEqual(engineBootstrap.$progressbar)
                        expect(engineBootstrap.$progressbar.parentNode).toEqual(engineBootstrap.$progress)
                        expect(engineBootstrap.$progress.parentNode).toEqual(engineBootstrap.$container)
                        expect(engineBootstrap.$label.nextSibling).toEqual(engineBootstrap.$progress)
                    })

                    it('should render elements with $label at the bottom', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body, {
                            'label_position': 'bottom'
                        })

                        engineBootstrap.render()

                        expect(engineBootstrap.$progress.nextSibling).toEqual(engineBootstrap.$label)
                    })
                })

                describe('_handle_progressbar_value()', function () {
                    it('should correctly change aria values', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body)

                        engineBootstrap.render()

                        expect(engineBootstrap.$progressbar.getAttribute('aria-valuemin')).toBeNull()
                        expect(engineBootstrap.$progressbar.getAttribute('aria-valuemax')).toBeNull()
                        expect(engineBootstrap.$progressbar.getAttribute('aria-valuenow')).toBeNull()

                        engineBootstrap._handle_progressbar_value('min', 0)
                        engineBootstrap._handle_progressbar_value('max', 100)
                        engineBootstrap._handle_progressbar_value('current', 50)

                        expect(engineBootstrap.$progressbar.getAttribute('aria-valuemin')).toEqual('0')
                        expect(engineBootstrap.$progressbar.getAttribute('aria-valuemax')).toEqual('100')
                        expect(engineBootstrap.$progressbar.getAttribute('aria-valuenow')).toEqual('50')
                    })

                    it('should correctly set the progressbar in an indeterminated mode', function () {
                        var engineBootstrap = new ProgressBarModule.EngineBootstrap(document.body)

                        engineBootstrap.render()

                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-striped')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('active')
                        expect(engineBootstrap.$progressbar.style.width).not.toEqual('100%')

                        engineBootstrap._handle_progressbar_value('indeterminate', true)

                        expect(engineBootstrap.$progressbar.classList).toContain('progress-bar-striped')
                        expect(engineBootstrap.$progressbar.classList).toContain('active')
                        expect(engineBootstrap.$progressbar.style.width).toEqual('100%')

                        engineBootstrap._handle_progressbar_value('indeterminate', false)

                        expect(engineBootstrap.$progressbar.classList).not.toContain('progress-bar-striped')
                        expect(engineBootstrap.$progressbar.classList).not.toContain('active')
                        expect(engineBootstrap.$progressbar.style.width).not.toEqual('100%')
                    })
                })
            })
        })
    })
})