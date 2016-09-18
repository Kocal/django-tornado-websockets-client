'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['tornadowebsocket'], factory);
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        module.exports = factory(require('tornadowebsocket'));
    } else {
        root.ProgressBarModule = factory(root.TornadoWebSocket);
    }
})(undefined, function (TornadoWebSocket) {
    'use strict';

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

    var ProgressBar = function (_TornadoWebSocket$Mod) {
        _inherits(ProgressBar, _TornadoWebSocket$Mod);

        /**
         * Initialize a new ProgressBarModule object with given parameters.
         *
         * @param {String}  suffix  String that will prefix _events name for TornadoWebSocket's on/emit methods.
         */
        function ProgressBar() {
            var suffix = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            _classCallCheck(this, ProgressBar);

            return _possibleConstructorReturn(this, (ProgressBar.__proto__ || Object.getPrototypeOf(ProgressBar)).call(this, 'progressbar_' + suffix + '_'));
        }

        _createClass(ProgressBar, [{
            key: 'set_engine',
            value: function set_engine(engine) {
                var _this2 = this;

                if (!(engine instanceof ProgressBar.EngineInterface)) {
                    throw new TypeError('Parameter « engine » should be an instance of ProgressBarModuleEngine.');
                }

                /**
                 * @prop {ProgressBar.EngineInterface}  engine  A progress bar engine that implementing this interface.
                 * @public
                 */
                this._engine = engine;

                this.on('init', function (data) {
                    _this2._engine.on_init.apply(_this2._engine, [data]);
                });

                this.on('update', function (data) {
                    _this2._engine.on_update.apply(_this2._engine, [data]);
                });

                this._engine.render();
            }
        }, {
            key: 'min',
            get: function get() {
                return this._engine ? this._engine._values.min : void 0;
            },
            set: function set(min) {
                if (this._engine) this._engine.update_progressbar_values({ min: min });
            }
        }, {
            key: 'max',
            get: function get() {
                return this._engine ? this._engine._values.max : void 0;
            },
            set: function set(max) {
                if (this._engine) this._engine.update_progressbar_values({ max: max });
            }
        }, {
            key: 'current',
            get: function get() {
                return this._engine ? this._engine._values.current : void 0;
            },
            set: function set(current) {
                if (this._engine) this._engine.update_progressbar_values({ current: current });
            }
        }, {
            key: 'progression',
            get: function get() {
                return this._engine ? this._engine.compute_progression() : void 0;
            }
        }]);

        return ProgressBar;
    }(TornadoWebSocket.Module);

    ProgressBar.EngineInterface = function () {
        function _class($container) {
            _classCallCheck(this, _class);

            if ($container === void 0 || !($container instanceof HTMLElement)) {
                throw new TypeError('Parameter « $container » should be an instance of HTMLElement.');
            }

            this._$container = $container;

            this._options = {};

            this._values = {};
        }

        _createClass(_class, [{
            key: 'render',
            value: function render() {
                this._create_elements();
                this._render_elements();
            }
        }, {
            key: 'on_init',
            value: function on_init(datas) {
                // default values
                var min = 0;
                var max = 100;
                var current = 0;

                var indeterminate = datas.indeterminate;

                if (datas.indeterminate === false) {
                    // next line is not working, I'm probably retarded XD :)
                    // {min, max, value} = datas

                    min = datas.min;
                    max = datas.max;
                    current = datas.value; // @TODO Change .value to .current (server side)
                }

                this.update_progressbar_values({ min: min, max: max, current: current, indeterminate: indeterminate });
                this.on_update({ current: current }); // @TODO value to current . . .
            }
        }, {
            key: 'on_update',
            value: function on_update(datas) {
                this.update_progressbar_values({ 'current': datas.current }); // @TODO value to current . . .
                this._update_progression();
                this._update_label(datas.label);
            }
        }, {
            key: 'compute_progression',
            value: function compute_progression() {
                return (this._values.current - this._values.min) * 100 / (this._values.max - this._values.min);
            }
        }, {
            key: 'format_progression',
            value: function format_progression(progression) {
                return this._options.progression_format.replace(/\{\{ *progress *}}/g, progression);
            }
        }, {
            key: 'update_progressbar_values',
            value: function update_progressbar_values(values) {
                var _this3 = this;

                Object.keys(values).forEach(function (key) {
                    _this3._values[key] = values[key];
                    _this3._handle_progressbar_value(key, values[key]);
                });
            }
        }, {
            key: '_handle_progressbar_value',
            value: function _handle_progressbar_value(key, value) {
                throw new Error('Method « _handle_progressbar_value » should be implemented by the engine.');
            }
        }, {
            key: '_create_elements',
            value: function _create_elements() {
                throw new Error('Method « _create_elements » should be implemented by the engine.');
            }
        }, {
            key: '_render_elements',
            value: function _render_elements() {
                throw new Error('Method « _render_elements » should be implemented by the engine.');
            }
        }, {
            key: '_update_label',
            value: function _update_label() {
                var label = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

                throw new Error('Method « _update_label » should be implemented by the engine.');
            }
        }, {
            key: '_update_progression',
            value: function _update_progression() {
                throw new Error('Method « _update_progression » should be implemented by the engine.');
            }
        }]);

        return _class;
    }();

    ProgressBar.EngineBootstrap = function (_ProgressBar$EngineIn) {
        _inherits(_class2, _ProgressBar$EngineIn);

        function _class2($container) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            _classCallCheck(this, _class2);

            var _this4 = _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this, $container));

            _this4._options = _extends({}, {
                'label_visible': true,
                'label_classes': ['progressbar-label'],
                'label_position': 'top',
                'progressbar_context': 'info',
                'progressbar_striped': false,
                'progressbar_animated': false,
                'progression_visible': true,
                'progression_format': '{{progress}} %'
            }, options);
            return _this4;
        }

        _createClass(_class2, [{
            key: '_update_progression',
            value: function _update_progression() {
                var progression = this.compute_progression();
                this._$progression.textContent = this.format_progression(progression);
                this._$progressbar.style.width = progression + '%';
            }
        }, {
            key: '_update_label',
            value: function _update_label() {
                var label = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

                this._$label.textContent = label;
            }
        }, {
            key: '_create_elements',
            value: function _create_elements() {
                var _this5 = this;

                // Progress HTML wrapper
                this._$progress = document.createElement('div');
                this._$progress.classList.add('progress');

                // Progress bar
                this._$progressbar = document.createElement('div');
                this._$progressbar.classList.add('progress-bar');
                this._$progressbar.setAttribute('role', 'progressbar');

                if (['info', 'success', 'warning', 'danger'].indexOf(this._options.progressbar_context) !== -1) {
                    this._$progressbar.classList.add('progress-bar-' + this._options.progressbar_context);
                }

                if (this._options.progressbar_striped === true) {
                    this._$progressbar.classList.add('progress-bar-striped');

                    // the progress bar can not be animated if it's not striped in Bootstrap (but it's logic :)) )
                    if (this._options.progressbar_animated === true) {
                        this._$progressbar.classList.add('active');
                    }
                }

                // Progression text (in the progress bar)
                this._$progression = document.createElement('span');
                if (this._options.progression_visible === false) {
                    this._$progression.classList.add('sr-only');
                }

                // Label at the top or bottom of the progress bar
                this._$label = document.createElement('span');
                this._options.label_classes.forEach(function (klass) {
                    return _this5._$label.classList.add(klass);
                });

                if (this._options.label_visible === false) {
                    this._$label.style.display = 'none';
                }
            }
        }, {
            key: '_render_elements',
            value: function _render_elements() {
                this._$progressbar.appendChild(this._$progression);
                this._$progress.appendChild(this._$progressbar);
                this._$container.appendChild(this._$progress);

                if (this._options.label_position === 'top') {
                    this._$container.insertBefore(this._$label, this._$progress);
                } else {
                    // bottom :^)
                    this._$container.appendChild(this._$label);
                }
            }
        }, {
            key: '_handle_progressbar_value',
            value: function _handle_progressbar_value(key, value) {
                switch (key) {
                    case 'min':
                    case 'max':
                    case 'current':
                        if (key === 'current') key = 'now';

                        this._$progressbar.setAttribute('aria-value' + key, value);
                        break;

                    case 'indeterminate':
                        if (value === true) {
                            this._$progressbar.classList.add('progress-bar-striped');
                            this._$progressbar.classList.add('active');
                            this._$progressbar.style.width = '100%';
                        } else {
                            this._$progressbar.classList.remove('progress-bar-striped');
                            this._$progressbar.classList.remove('active');
                            this._$progressbar.style.width = '';
                        }
                }
            }
        }]);

        return _class2;
    }(ProgressBar.EngineInterface);

    ProgressBar.EngineHtml5 = function (_ProgressBar$EngineIn2) {
        _inherits(_class3, _ProgressBar$EngineIn2);

        function _class3($container) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            _classCallCheck(this, _class3);

            var _this6 = _possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).call(this, $container));

            _this6._options = _extends({}, {
                'label_visible': true,
                'label_classes': ['progressbar-label'],
                'label_position': 'top',
                'progression_visible': true,
                'progression_format': '{{progress}}%',
                'progression_position': 'right'
            }, options);
            return _this6;
        }

        _createClass(_class3, [{
            key: '_update_progression',
            value: function _update_progression() {
                this._$progression.textContent = this.format_progression(this.compute_progression());
            }
        }, {
            key: '_update_label',
            value: function _update_label(label) {
                this._$label.textContent = label;
            }
        }, {
            key: '_create_elements',
            value: function _create_elements() {
                var _this7 = this;

                // Progress HTML wrapper
                this._$progress = document.createElement('div');
                this._$progress.classList.add('progress');

                // Progress bar
                this._$progressbar = document.createElement('progress');
                this._$progressbar.classList.add('progress-bar');

                // Progression text (at the left/right of the progress bar)
                this._$progression = document.createElement('span');
                if (this._options.progression_visible === false) {
                    this._$progression.style.display = 'none';
                }

                // Label at the top or the bottom of the progress bar
                this._$label = document.createElement('span');
                this._options.label_classes.forEach(function (klass) {
                    return _this7._$label.classList.add(klass);
                });

                if (this._options.label_visible === false) {
                    this._$label.style.display = 'none';
                }
            }
        }, {
            key: '_render_elements',
            value: function _render_elements() {
                this._$progress.appendChild(this._$progressbar);
                this._$container.appendChild(this._$progress);
                if (this._options.label_position === 'top') {
                    this._$container.insertBefore(this._$label, this._$progress);
                } else {
                    this._$container.appendChild(this._$label);
                }
                if (this._options.progression_position === 'left') {
                    this._$progressbar.parentNode.insertBefore(this._$progression, this._$progressbar);
                } else {
                    this._$progressbar.parentNode.insertBefore(this._$progression, this._$progressbar.nextSibling);
                }
            }
        }, {
            key: '_handle_progressbar_value',
            value: function _handle_progressbar_value(key, value) {
                switch (key) {
                    case 'min':
                    case 'max':
                    case 'current':
                    case 'value':
                        if (key === 'current') key = 'value';

                        this._$progressbar.setAttribute(key, value);
                        break;
                    case 'indeterminate':
                        if (value === true) {
                            this._$progressbar.removeAttribute('min');
                            this._$progressbar.removeAttribute('max');
                            this._$progressbar.removeAttribute('value');
                        } else {
                            this.update_progressbar_values({
                                'min': this._values.min,
                                'max': this._values.max,
                                'current': this._values.current
                            });
                        }
                }
            }
        }]);

        return _class3;
    }(ProgressBar.EngineInterface);

    return ProgressBar;
});