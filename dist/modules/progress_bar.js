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

    var ProgressBar = function (_TornadoWebSocket$Mod) {
        _inherits(ProgressBar, _TornadoWebSocket$Mod);

        /**
         * Initialize a new ProgressBarModule object with given parameters.
         *
         * @param {String}  prefix  String that will prefix events name for TornadoWebSocket's on/emit methods.
         */
        function ProgressBar() {
            var prefix = arguments.length <= 0 || arguments[0] === undefined ? 'module_progressbar_' : arguments[0];

            _classCallCheck(this, ProgressBar);

            return _possibleConstructorReturn(this, (ProgressBar.__proto__ || Object.getPrototypeOf(ProgressBar)).call(this, prefix));
        }

        _createClass(ProgressBar, [{
            key: 'set_engine',
            value: function set_engine(engine) {
                var _this2 = this;

                if (!(engine instanceof TornadoWebSocket.modules.ProgressBar.Engine)) {
                    throw new TypeError('Parameter « engine » should be an instance of ProgressBarModuleEngine, got ' + (typeof engine === 'undefined' ? 'undefined' : _typeof(engine)) + ' instead.');
                }

                /**
                 * @prop {ProgressBar.EngineInterface}  engine  A progress bar engine that implementing this interface.
                 * @public
                 */
                this.engine = engine;

                this.on('init', function (data) {
                    _this2.engine.on_init.apply(_this2.engine, [data]);
                });

                this.on('update', function (data) {
                    _this2.engine.on_update.apply(_this2.engine, [data]);
                });

                this.engine.render();
            }
        }]);

        return ProgressBar;
    }(TornadoWebSocket.Module);

    ProgressBar.EngineInterface = function () {
        function _class($container, options) {
            _classCallCheck(this, _class);

            if ($container === void 0 || !($container instanceof HTMLElement)) {
                throw new TypeError('Parameter « $container » should be an instance of HTMLElement, got ' + (typeof $container === 'undefined' ? 'undefined' : _typeof($container)) + ' instead.');
            }

            if (options !== null || options instanceof Object) {
                throw new TypeError('Parameter « options » should be an Object, got ' + (typeof options === 'undefined' ? 'undefined' : _typeof(options)) + ' instead.');
            }

            this.$container = $container;

            _extends(this.options, this.defaults, options);
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

                this._register_values({ min: min, max: max, current: current, indeterminate: indeterminate });
                this.on_update({ value: current }); // @TODO value to current . . .
            }
        }, {
            key: 'on_update',
            value: function on_update(datas) {
                this._register_values({ current: datas.value }); // @TODO value to current . . .
                this.update_progression();
                this.update_label(datas.label);
            }
        }, {
            key: 'update_label',
            value: function update_label(label) {
                return false;
            }
        }, {
            key: 'update_progression',
            value: function update_progression() {
                return false;
            }
        }, {
            key: '_register_values',
            value: function _register_values(values) {
                for (var key in values) {
                    this[key] = values[key];
                    this._register(key, this[key]);
                }
            }
        }, {
            key: '_register',
            value: function _register(key, value) {
                return false;
            }
        }, {
            key: '_create_elements',
            value: function _create_elements() {
                return false;
            }
        }, {
            key: '_render_elements',
            value: function _render_elements() {
                return false;
            }
        }]);

        return _class;
    }();

    ProgressBar.EngineBootstrap = function (_ProgressBar$EngineIn) {
        _inherits(_class2, _ProgressBar$EngineIn);

        function _class2($container, options) {
            _classCallCheck(this, _class2);

            // Default options, style waiting for member declaration outside the constructor
            ProgressBar.EngineBootstrap.defaults = {
                label_visible: true,
                label_classes: ['progressbar-label'],
                label_position: 'top',
                progressbar_context: 'info',
                progressbar_striped: false,
                progressbar_animated: false,
                progression_visible: true,
                progression_format: '{{percent}} %'
            };

            return _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this, $container, options));
        }

        _createClass(_class2, [{
            key: 'update_progression',
            value: function update_progression() {
                this.$progression.textContent = this.format_progression(this.calcul_progression());
            }
        }, {
            key: 'update_label',
            value: function update_label(label) {
                if (label !== void 0) {
                    this.$label.textContent = label;
                }
            }
        }, {
            key: '_create_elements',
            value: function _create_elements() {
                // Progress HTML wrapper
                this.$progress = document.createElement('div');
                this.$progress.classList.add('progress');

                // Progress bar
                this.$progressbar = document.createElement('div');
                this.$progressbar.classList.add('progress-bar');
                this.$progressbar.setAttribute('role', 'progressbar');

                if (['info', 'success', 'warning', 'danger'].indexOf(this.options.progressbar_context) !== -1) {
                    this.$progressbar.classList.add('progress-bar-' + this.options.progressbar_context);
                }

                if (this.options.progressbar_striped === true) {
                    this.$progressbar.classList.add('progress-bar-striped');

                    // the progress bar can not be animated if it's not striped in Bootstrap (but it's logic :)) )
                    if (this.options.progressbar_animated === true) {
                        this.$progressbar.classList.add('active');
                    }
                }

                // Progression text (in the progress bar)
                this.$progression = document.createElement('span');
                if (this.options.progression.visible === false) {
                    this.$progression.classList.add('sr-only');
                }

                // Label at the top or bottom of the progress bar
                this.$label = document.createElement('span');
                for (var klass in this.options.label_classes) {
                    this.$label.classList.add(klass);
                }

                if (this.options.label.visible === false) {
                    this.$label.style.display = 'none';
                }
            }
        }, {
            key: '_render_elements',
            value: function _render_elements() {
                this.$progressbar.appendChild(this.$progression);
                this.$progress.appendChild(this.$progressbar);
                this.$container.appendChild(this.$progress);

                if (this.options.label.position === 'top') {
                    this.$container.insertBefore(this.$label, this.$progress);
                } else {
                    // bottom :^)
                    this.$container.appendChild(this.$label);
                }
            }
        }, {
            key: '_register',
            value: function _register(key, value) {
                switch (key) {
                    case 'min':
                    case 'max':
                    case 'value':
                        if (key === 'value') {
                            key = 'now';
                        }

                        this.$progressbar.setAttribute('aria-value' + key, value);
                        break;

                    case 'indeterminate':
                        if (value === true) {
                            this.$progressbar.classList.add('progress-bar-striped');
                            this.$progressbar.classList.add('active');
                            this.$progressbar.style.width = '100%';
                        }
                }
            }
        }]);

        return _class2;
    }(ProgressBar.EngineInterface);

    ProgressBar.EngineHtml5 = function (_ProgressBar$EngineIn2) {
        _inherits(_class3, _ProgressBar$EngineIn2);

        function _class3($element, options) {
            _classCallCheck(this, _class3);

            ProgressBar.EngineHtml5.defaults = {
                label_visible: true,
                label_classes: ['progressbar-label'],
                label_position: 'top',
                progression_visible: true,
                progression_format: '{{percent}}%',
                progression_position: 'right'
            };

            return _possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).call(this, $element, options));
        }

        _createClass(_class3, [{
            key: 'update_progression',
            value: function update_progression() {
                this.$progression.textContent = this.format_progression(this.calcul_progression());
            }
        }, {
            key: 'update_label',
            value: function update_label(label) {
                if (label !== void 0) {
                    this.$label.textContent = label;
                }
            }
        }, {
            key: '_create_elements',
            value: function _create_elements() {
                // Progress HTML wrapper
                this.$progress = document.createElement('div');
                this.$progress.classList.add('progress');

                // Progress bar
                this.$progressbar = document.createElement('progress');
                this.$progressbar.classList.add('progress-bar');

                // Progression text (at the left/right of the progress bar)
                this.$progression = document.createElement('span');
                if (this.options.progression_visible === false) {
                    this.$progression.style.display = 'none';
                }

                // Label at the top or the bottom of the progress bar
                this.$label = document.createElement('span');
                for (var klass in this.options.label_classes) {
                    this.$label.classList.add(klass);
                }

                if (this.options.label_visible === false) {
                    this.$label.style.display = 'none';
                }
            }
        }, {
            key: '_render_elements',
            value: function _render_elements() {
                this.$progress.appendChild(this.$progressbar);
                this.$container.appendChild(this.$progress);
                if (this.options.label_position === 'top') {
                    this.$container.insertBefore(this.$label, this.$progress);
                } else {
                    this.$container.appendChild(this.$label);
                }
                if (this.options.progression_position === 'left') {
                    this.$progressbar.parentNode.insertBefore(this.$progression, this.$progressbar);
                } else {
                    this.$progressbar.parentNode.insertBefore(this.$progression, this.$progressbar.nextSibling);
                }
            }
        }, {
            key: '_register',
            value: function _register(key, value) {
                switch (key) {
                    case 'min':
                    case 'max':
                    case 'value':
                        this.$progressbar.setAttribute(key, value);
                        break;
                    case 'indeterminate':
                        if (value === true) {
                            this.$progressbar.removeAttribute('min');
                            this.$progressbar.removeAttribute('max');
                            this.$progressbar.removeAttribute('value');
                        }
                }
            }
        }]);

        return _class3;
    }(ProgressBar.EngineInterface);

    return ProgressBar;
});