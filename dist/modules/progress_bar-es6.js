(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['../client-es6'], factory)
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('../client-es6'))
    } else {
        root.ProgressBarModule = factory(root.TornadoWebSocket)
    }
}(this, function(TornadoWebSocket) {
    'use strict'

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
    class ProgressBar extends TornadoWebSocket.Module {

        /**
         * Initialize a new ProgressBarModule object with given parameters.
         *
         * @param {String}  prefix  String that will prefix events name for TornadoWebSocket's on/emit methods.
         */
        constructor(prefix = 'module_progressbar_') {
            super(prefix)
        }

        /**
         * Should be called by the user.
         * Binds `init` and `update` events and render the progress bar from defined engine.
         */
        setUp() {
            this.on('init', (data) => {
                return this.engine.onInit.apply(this.engine, [data])
            })

            this.on('update', (data) => {
                return this.engine.onUpdate.apply(this.engine, [data])
            })

            this.engine.render()
        }

        setEngine(engine) {
            if (!(engine instanceof TornadoWebSocket.modules.ProgressBar.Engine)) {
                throw new TypeError(
                    `Parameter « engine » should be an instance of ProgressBarModuleEngine, got ${typeof engine} instead.`
                )
            }

            /**
             * @prop {ProgressBarModuleEngine}  engine  A progress bar engine that implementing ProgressBar.Engine.
             * @public
             */
            this.engine = engine
        }

    }

    return ProgressBar

}))