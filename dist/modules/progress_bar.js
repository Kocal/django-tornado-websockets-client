'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['../client-es6'], factory);
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        module.exports = factory(require('../client-es6'));
    } else {
        root.ProgressBarModule = factory(root.TornadoWebSocket);
    }
})(undefined, function (TornadoWebSocket) {
    'use strict';

    /**
     * @example
     * var websocket = new TornadoWebSocket('/my_websocket')
     * var progress = new ProgressBar('progress_')
      * var $container = document.querySelector('#container')
     *
     * progress.bindWebSocket(websocket)
     * progress.setEngine(new progress.engines.Bootstrap($container,
     *     progressbar: {
     *         animated: true,
     *         striped: true
     *     }
     * ))
     *
     * websocket.on('open', _ => {
     *     // emit 'event'
     *     websocket.emit('event ...')
     *
     *     // emit 'progress_event'
     *     progress.emit('event ')
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
     *
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

            return _possibleConstructorReturn(this, Object.getPrototypeOf(ProgressBar).call(this, prefix));
        }

        /**
         * Should be called by the user.
         * Binds `init` and `update` events and render the progress bar from defined engine.
         */


        _createClass(ProgressBar, [{
            key: 'setUp',
            value: function setUp() {
                var _this2 = this;

                this.on('init', function (data) {
                    return _this2.engine.onInit.apply(_this2.engine, [data]);
                });

                this.on('update', function (data) {
                    return _this2.engine.onUpdate.apply(_this2.engine, [data]);
                });

                this.engine.render();
            }
        }, {
            key: 'setEngine',
            value: function setEngine(engine) {
                if (!(engine instanceof TornadoWebSocket.modules.ProgressBar.Engine)) {
                    throw new TypeError('Parameter « engine » should be an instance of ProgressBarModuleEngine, got ' + (typeof engine === 'undefined' ? 'undefined' : _typeof(engine)) + ' instead.');
                }

                /**
                 * @prop {ProgressBarModuleEngine}  engine  A progress bar engine that implementing ProgressBar.Engine.
                 * @public
                 */
                this.engine = engine;
            }
        }]);

        return ProgressBar;
    }(TornadoWebSocket.Module);

    return ProgressBar;
});