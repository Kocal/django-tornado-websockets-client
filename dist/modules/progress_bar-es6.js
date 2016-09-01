(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['tornadowebsocket-es6'], factory)
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('tornadowebsocket-es6'))
    } else {
        root.ProgressBarModule = factory(root.TornadoWebSocket)
    }
}(this, function (TornadoWebSocket) {
    'use strict'

    /**
     * @example
     * const websocket = new TornadoWebSocket('/my_websocket')
     * const progress = new ProgressBar('progress_')

     * const $container = document.querySelector('#container')
     *
     * progress.bind_websocket(websocket)
     * progress.set_engine(new progress.EngineBootstrap($container,
     *     progressbar: {
     *         animated: true,
     *         striped: true
     *     }
     * ))
     *
     * websocket.on('open', _ => {
     *     // emit 'event'
     *     websocket.emit('event', ...)
     *
     *     // emit 'progress_event'
     *     progress.emit('event', ...)
     *
     *     progress.on('before_init', _ => {
     *         // Is called before progress bar initialization
     *     })
     *
     *     progress.on('after_init', _ => {
     *         // Is called after progress bar initialization
     *     })
     *
     *     progress.on('before_update', _ => {
     *         // Is called before progress bar update
     *     })
     *
     *     progress.on('after_update', _ => {
     *         // Is called after progress bar update
     *     })
     *
     *     progress.on('done', _ => {
     *         // Is called when progression is done
     *     })
     * })
     */
    class ProgressBar extends TornadoWebSocket.Module {

        /**
         * Initialize a new ProgressBarModule object with given parameters.
         *
         * @param {String}  prefix  String that will prefix events name for TornadoWebSocket's on/emit methods.
         */
        constructor(prefix = 'module_progressbar_') {
            super(prefix)
        }

        set_engine(engine) {
            if (!(engine instanceof TornadoWebSocket.modules.ProgressBar.Engine)) {
                throw new TypeError(
                    `Parameter « engine » should be an instance of ProgressBarModuleEngine, got ${typeof engine} instead.`
                )
            }

            /**
             * @prop {ProgressBar.EngineInterface}  engine  A progress bar engine that implementing this interface.
             * @public
             */
            this.engine = engine

            this.on('init', (data) => {
                this.engine.on_init.apply(this.engine, [data])
            })

            this.on('update', (data) => {
                this.engine.on_update.apply(this.engine, [data])
            })

            this.engine.render()
        }
    }

    ProgressBar.EngineInterface = class {

        constructor($container, options) {
            if ($container === void 0 || !($container instanceof HTMLElement)) {
                throw new TypeError(
                    `Parameter « $container » should be an instance of HTMLElement, got ${typeof $container} instead.`
                )
            }

            if (options !== null || options instanceof Object) {
                throw new TypeError(`Parameter « options » should be an Object, got ${typeof options} instead.`)
            }

            this.$container = $container

            Object.assign(this.options, this.defaults, options)
        }

        render() {
            this._create_elements()
            this._render_elements()
        }

        on_init(datas) {
            // default values
            let [min, max, current] = [0, 100, 0]
            let indeterminate = datas.indeterminate

            if (datas.indeterminate === false) {
                // next line is not working, I'm probably retarded XD :)
                // {min, max, value} = datas

                min = datas.min
                max = datas.max
                current = datas.value // @TODO Change .value to .current (server side)
            }

            this._register_values({min, max, current, indeterminate})
            this.on_update({value: current}) // @TODO value to current . . .
        }

        on_update(datas) {
            this._register_values({current: datas.value}) // @TODO value to current . . .
            this.update_progression()
            this.update_label(datas.label)
        }

        update_label(label) {
            return false
        }

        update_progression() {
            return false
        }

        _register_values(values) {
            for (let key in values) {
                this[key] = values[key]
                this._register(key, this[key])
            }
        }

        _register(key, value) {
            return false
        }

        _create_elements() {
            return false
        }

        _render_elements() {
            return false
        }
    }

    ProgressBar.EngineBootstrap = class extends ProgressBar.EngineInterface {

        constructor($container, options) {
            // Default options, style waiting for member declaration outside the constructor
            ProgressBar.EngineBootstrap.defaults = {
                label_visible: true,
                label_classes: ['progressbar-label'],
                label_position: 'top',
                progressbar_context: 'info',
                progressbar_striped: false,
                progressbar_animated: false,
                progression_visible: true,
                progression_format: '{{percent}} %',
            }

            super($container, options)
        }

        update_progression() {
            this.$progression.textContent = this.format_progression(this.calcul_progression())
        }

        update_label(label) {
            if (label !== void 0) {
                this.$label.textContent = label
            }
        }

        _create_elements() {
            // Progress HTML wrapper
            this.$progress = document.createElement('div')
            this.$progress.classList.add('progress')

            // Progress bar
            this.$progressbar = document.createElement('div')
            this.$progressbar.classList.add('progress-bar')
            this.$progressbar.setAttribute('role', 'progressbar')

            if (['info', 'success', 'warning', 'danger'].includes(this.options.progressbar_context)) {
                this.$progressbar.classList.add('progress-bar-' + this.options.progressbar_context)
            }

            if (this.options.progressbar_striped === true) {
                this.$progressbar.classList.add('progress-bar-striped')

                // the progress bar can not be animated if it's not striped in Bootstrap (but it's logic :)) )
                if (this.options.progressbar_animated === true) {
                    this.$progressbar.classList.add('active')
                }
            }

            // Progression text (in the progress bar)
            this.$progression = document.createElement('span')
            if (this.options.progression.visible === false) {
                this.$progression.classList.add('sr-only')
            }

            // Label at the top or bottom of the progress bar
            this.$label = document.createElement('span')
            for (let klass in this.options.label_classes) {
                this.$label.classList.add(klass)
            }

            if (this.options.label.visible === false) {
                this.$label.style.display = 'none'
            }
        }

        _render_elements() {
            this.$progressbar.appendChild(this.$progression)
            this.$progress.appendChild(this.$progressbar)
            this.$container.appendChild(this.$progress)

            if (this.options.label.position === 'top') {
                this.$container.insertBefore(this.$label, this.$progress)
            } else { // bottom :^)
                this.$container.appendChild(this.$label)
            }
        }

        _register(key, value) {
            switch (key) {
            case 'min':
            case 'max':
            case 'value':
                if (key === 'value') {
                    key = 'now'
                }

                this.$progressbar.setAttribute('aria-value' + key, value)
                break

            case 'indeterminate':
                if (value === true) {
                    this.$progressbar.classList.add('progress-bar-striped')
                    this.$progressbar.classList.add('active')
                    this.$progressbar.style.width = '100%'
                }
            }
        }
    }

    ProgressBar.EngineHtml5 = class extends ProgressBar.EngineInterface {

        constructor($element, options) {
            ProgressBar.EngineHtml5.defaults = {
                label_visible: true,
                label_classes: ['progressbar-label'],
                label_position: 'top',
                progression_visible: true,
                progression_format: '{{percent}}%',
                progression_position: 'right'
            }

            super($element, options)
        }

        update_progression() {
            this.$progression.textContent = this.format_progression(this.calcul_progression())
        }

        update_label(label) {
            if (label !== void 0) {
                this.$label.textContent = label
            }
        }

        _create_elements() {
            // Progress HTML wrapper
            this.$progress = document.createElement('div')
            this.$progress.classList.add('progress')

            // Progress bar
            this.$progressbar = document.createElement('progress')
            this.$progressbar.classList.add('progress-bar')

            // Progression text (at the left/right of the progress bar)
            this.$progression = document.createElement('span')
            if (this.options.progression_visible === false) {
                this.$progression.style.display = 'none'
            }

            // Label at the top or the bottom of the progress bar
            this.$label = document.createElement('span')
            for (let klass in this.options.label_classes) {
                this.$label.classList.add(klass)
            }

            if (this.options.label_visible === false) {
                this.$label.style.display = 'none'
            }
        }

        _render_elements() {
            this.$progress.appendChild(this.$progressbar)
            this.$container.appendChild(this.$progress)
            if (this.options.label_position === 'top') {
                this.$container.insertBefore(this.$label, this.$progress)
            } else {
                this.$container.appendChild(this.$label)
            }
            if (this.options.progression_position === 'left') {
                this.$progressbar.parentNode.insertBefore(this.$progression, this.$progressbar)
            } else {
                this.$progressbar.parentNode.insertBefore(this.$progression, this.$progressbar.nextSibling)

            }
        }

        _register(key, value) {
            switch (key) {
            case 'min':
            case 'max':
            case 'value':
                this.$progressbar.setAttribute(key, value)
                break
            case 'indeterminate':
                if (value === true) {
                    this.$progressbar.removeAttribute('min')
                    this.$progressbar.removeAttribute('max')
                    this.$progressbar.removeAttribute('value')
                }
            }
        }
    }

    return ProgressBar
}))
