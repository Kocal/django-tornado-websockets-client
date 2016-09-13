(function (root, factory) {
    /* istanbul ignore next */
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
    let ProgressBar = class extends TornadoWebSocket.Module {

        /**
         * Initialize a new ProgressBarModule object with given parameters.
         *
         * @param {String}  suffix  String that will prefix events name for TornadoWebSocket's on/emit methods.
         */
        constructor(suffix = '') {
            super(`progressbar_${suffix}_`)
        }

        set_engine(engine) {
            if (!(engine instanceof ProgressBar.EngineInterface)) {
                throw new TypeError('Parameter « engine » should be an instance of ProgressBarModuleEngine.')
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

        get min() {
            return (this.engine ? this.engine.values.min : void 0)
        }

        set min(min) {
            if (this.engine) this.engine.update_progressbar_values({min})
        }

        get max() {
            return (this.engine ? this.engine.values.max : void 0)
        }

        set max(max) {
            if (this.engine) this.engine.update_progressbar_values({max})
        }

        get current() {
            return (this.engine ? this.engine.values.current : void 0)
        }

        set current(current) {
            if (this.engine) this.engine.update_progressbar_values({current})
        }

        get progression() {
            return (this.engine ? this.engine.compute_progression() : void 0)
        }
    }

    ProgressBar.EngineInterface = class {

        constructor($container) {
            if ($container === void 0 || !($container instanceof HTMLElement)) {
                throw new TypeError('Parameter « $container » should be an instance of HTMLElement.')
            }

            this.$container = $container

            this.defaults = {}

            this.options = {}

            this.values = {}
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

            this.update_progressbar_values({min, max, current, indeterminate})
            this.on_update({current}) // @TODO value to current . . .
        }

        on_update(datas) {
            this.update_progressbar_values({'current': datas.current}) // @TODO value to current . . .
            this._update_progression()
            this._update_label(datas.label)
        }

        compute_progression() {
            return (this.values.current - this.values.min) * 100 / (this.values.max - this.values.min)
        }

        format_progression(progression) {
            return this.options.progression_format.replace(/\{\{ *progress *}}/g, progression)
        }

        update_progressbar_values(values) {
            Object.keys(values).forEach(key => {
                this.values[key] = values[key]
                this._handle_progressbar_value(key, values[key])
            })
        }

        _handle_progressbar_value(key, value) {
            throw new Error('Method « _handle_progressbar_value » should be implemented by the engine.')
        }

        _create_elements() {
            throw new Error('Method « _create_elements » should be implemented by the engine.')
        }

        _render_elements() {
            throw new Error('Method « _render_elements » should be implemented by the engine.')
        }

        _update_label(label = '') {
            throw new Error('Method « _update_label » should be implemented by the engine.')
        }

        _update_progression() {
            throw new Error('Method « _update_progression » should be implemented by the engine.')
        }
    }

    ProgressBar.EngineBootstrap = class extends ProgressBar.EngineInterface {

        constructor($container, options = {}) {
            super($container)

            this.defaults = {
                'label_visible': true,
                'label_classes': ['progressbar-label'],
                'label_position': 'top',
                'progressbar_context': 'info',
                'progressbar_striped': false,
                'progressbar_animated': false,
                'progression_visible': true,
                'progression_format': '{{progress}} %',
            }

            Object.assign(this.options, this.defaults, options)
        }

        _update_progression() {
            let progression = this.compute_progression()
            this.$progression.textContent = this.format_progression(progression)
            this.$progressbar.style.width = progression + '%'
        }

        _update_label(label = '') {
            this.$label.textContent = label
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
            if (this.options.progression_visible === false) {
                this.$progression.classList.add('sr-only')
            }

            // Label at the top or bottom of the progress bar
            this.$label = document.createElement('span')
            this.options.label_classes.forEach(klass => this.$label.classList.add(klass))

            if (this.options.label_visible === false) {
                this.$label.style.display = 'none'
            }
        }

        _render_elements() {
            this.$progressbar.appendChild(this.$progression)
            this.$progress.appendChild(this.$progressbar)
            this.$container.appendChild(this.$progress)

            if (this.options.label_position === 'top') {
                this.$container.insertBefore(this.$label, this.$progress)
            } else { // bottom :^)
                this.$container.appendChild(this.$label)
            }
        }

        _handle_progressbar_value(key, value) {
            switch (key) {
            case 'min':
            case 'max':
            case 'current':
                if (key === 'current') key = 'now'

                this.$progressbar.setAttribute('aria-value' + key, value)
                break

            case 'indeterminate':
                if (value === true) {
                    this.$progressbar.classList.add('progress-bar-striped')
                    this.$progressbar.classList.add('active')
                    this.$progressbar.style.width = '100%'
                } else {
                    this.$progressbar.classList.remove('progress-bar-striped')
                    this.$progressbar.classList.remove('active')
                    this.$progressbar.style.width = ''
                }
            }
        }
    }

    ProgressBar.EngineHtml5 = class extends ProgressBar.EngineInterface {

        constructor($element, options = {}) {
            super($element)

            this.defaults = {
                'label_visible': true,
                'label_classes': ['progressbar-label'],
                'label_position': 'top',
                'progression_visible': true,
                'progression_format': '{{progress}}%',
                'progression_position': 'right'
            }

            Object.assign(this.options, this.defaults, options)
        }

        _update_progression() {
            this.$progression.textContent = this.format_progression(this.compute_progression())
        }

        _update_label(label) {
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
            this.options.label_classes.forEach(klass => this.$label.classList.add(klass))

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

        _handle_progressbar_value(key, value) {
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
