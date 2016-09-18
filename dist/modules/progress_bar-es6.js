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
     * const tws = new TornadoWebSocket('/my_websocket')
     * const progress = new ProgressBar('progress_')
     *
     * tws.bind_module(progress)
     * progress.set_engine(new progress.EngineBootstrap(document.querySelector('#container'),
     *     progressbar: {
     *         animated: true,
     *         striped: true
     *     }
     * ))
     *
     * tws.on('open', _ => {
     *     // emit 'event'
     *     tws.emit('event', ...)
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
         * @param {String}  suffix  String that will prefix _events name for TornadoWebSocket's on/emit methods.
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
            this._engine = engine

            this.on('init', (data) => {
                this._engine.on_init.apply(this._engine, [data])
            })

            this.on('update', (data) => {
                this._engine.on_update.apply(this._engine, [data])
            })

            this._engine.render()
        }

        get min() {
            return (this._engine ? this._engine._values.min : void 0)
        }

        set min(min) {
            if (this._engine) this._engine.update_progressbar_values({min})
        }

        get max() {
            return (this._engine ? this._engine._values.max : void 0)
        }

        set max(max) {
            if (this._engine) this._engine.update_progressbar_values({max})
        }

        get current() {
            return (this._engine ? this._engine._values.current : void 0)
        }

        set current(current) {
            if (this._engine) this._engine.update_progressbar_values({current})
        }

        get progression() {
            return (this._engine ? this._engine.compute_progression() : void 0)
        }
    }

    ProgressBar.EngineInterface = class {

        constructor($container) {
            if ($container === void 0 || !($container instanceof HTMLElement)) {
                throw new TypeError('Parameter « $container » should be an instance of HTMLElement.')
            }

            this._$container = $container

            this._options = {}

            this._values = {}
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
            return (this._values.current - this._values.min) * 100 / (this._values.max - this._values.min)
        }

        format_progression(progression) {
            return this._options.progression_format.replace(/\{\{ *progress *}}/g, progression)
        }

        update_progressbar_values(values) {
            Object.keys(values).forEach(key => {
                this._values[key] = values[key]
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

            this._options = Object.assign({}, {
                'label_visible': true,
                'label_classes': ['progressbar-label'],
                'label_position': 'top',
                'progressbar_context': 'info',
                'progressbar_striped': false,
                'progressbar_animated': false,
                'progression_visible': true,
                'progression_format': '{{progress}} %',
            }, options)
        }

        _update_progression() {
            let progression = this.compute_progression()
            this._$progression.textContent = this.format_progression(progression)
            this._$progressbar.style.width = progression + '%'
        }

        _update_label(label = '') {
            this._$label.textContent = label
        }

        _create_elements() {
            // Progress HTML wrapper
            this._$progress = document.createElement('div')
            this._$progress.classList.add('progress')

            // Progress bar
            this._$progressbar = document.createElement('div')
            this._$progressbar.classList.add('progress-bar')
            this._$progressbar.setAttribute('role', 'progressbar')

            if (['info', 'success', 'warning', 'danger'].includes(this._options.progressbar_context)) {
                this._$progressbar.classList.add('progress-bar-' + this._options.progressbar_context)
            }

            if (this._options.progressbar_striped === true) {
                this._$progressbar.classList.add('progress-bar-striped')

                // the progress bar can not be animated if it's not striped in Bootstrap (but it's logic :)) )
                if (this._options.progressbar_animated === true) {
                    this._$progressbar.classList.add('active')
                }
            }

            // Progression text (in the progress bar)
            this._$progression = document.createElement('span')
            if (this._options.progression_visible === false) {
                this._$progression.classList.add('sr-only')
            }

            // Label at the top or bottom of the progress bar
            this._$label = document.createElement('span')
            this._options.label_classes.forEach(klass => this._$label.classList.add(klass))

            if (this._options.label_visible === false) {
                this._$label.style.display = 'none'
            }
        }

        _render_elements() {
            this._$progressbar.appendChild(this._$progression)
            this._$progress.appendChild(this._$progressbar)
            this._$container.appendChild(this._$progress)

            if (this._options.label_position === 'top') {
                this._$container.insertBefore(this._$label, this._$progress)
            } else { // bottom :^)
                this._$container.appendChild(this._$label)
            }
        }

        _handle_progressbar_value(key, value) {
            switch (key) {
            case 'min':
            case 'max':
            case 'current':
                if (key === 'current') key = 'now'

                this._$progressbar.setAttribute('aria-value' + key, value)
                break

            case 'indeterminate':
                if (value === true) {
                    this._$progressbar.classList.add('progress-bar-striped')
                    this._$progressbar.classList.add('active')
                    this._$progressbar.style.width = '100%'
                } else {
                    this._$progressbar.classList.remove('progress-bar-striped')
                    this._$progressbar.classList.remove('active')
                    this._$progressbar.style.width = ''
                }
            }
        }
    }

    ProgressBar.EngineHtml5 = class extends ProgressBar.EngineInterface {

        constructor($container, options = {}) {
            super($container)

            this._options = Object.assign({}, {
                'label_visible': true,
                'label_classes': ['progressbar-label'],
                'label_position': 'top',
                'progression_visible': true,
                'progression_format': '{{progress}}%',
                'progression_position': 'right'
            }, options)
        }

        _update_progression() {
            this._$progression.textContent = this.format_progression(this.compute_progression())
        }

        _update_label(label) {
            this._$label.textContent = label
        }

        _create_elements() {
            // Progress HTML wrapper
            this._$progress = document.createElement('div')
            this._$progress.classList.add('progress')

            // Progress bar
            this._$progressbar = document.createElement('progress')
            this._$progressbar.classList.add('progress-bar')

            // Progression text (at the left/right of the progress bar)
            this._$progression = document.createElement('span')
            if (this._options.progression_visible === false) {
                this._$progression.style.display = 'none'
            }

            // Label at the top or the bottom of the progress bar
            this._$label = document.createElement('span')
            this._options.label_classes.forEach(klass => this._$label.classList.add(klass))

            if (this._options.label_visible === false) {
                this._$label.style.display = 'none'
            }
        }

        _render_elements() {
            this._$progress.appendChild(this._$progressbar)
            this._$container.appendChild(this._$progress)
            if (this._options.label_position === 'top') {
                this._$container.insertBefore(this._$label, this._$progress)
            } else {
                this._$container.appendChild(this._$label)
            }
            if (this._options.progression_position === 'left') {
                this._$progressbar.parentNode.insertBefore(this._$progression, this._$progressbar)
            } else {
                this._$progressbar.parentNode.insertBefore(this._$progression, this._$progressbar.nextSibling)

            }
        }

        _handle_progressbar_value(key, value) {
            switch (key) {
            case 'min':
            case 'max':
            case 'current':
            case 'value':
                if (key === 'current') key = 'value'

                this._$progressbar.setAttribute(key, value)
                break
            case 'indeterminate':
                if (value === true) {
                    this._$progressbar.removeAttribute('min')
                    this._$progressbar.removeAttribute('max')
                    this._$progressbar.removeAttribute('value')
                } else {
                    this.update_progressbar_values({
                        'min': this._values.min,
                        'max': this._values.max,
                        'current': this._values.current
                    })
                }
            }
        }
    }

    return ProgressBar
}))
