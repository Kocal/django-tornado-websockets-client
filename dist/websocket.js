var WebSocket;

WebSocket = (function() {

    /**
     * Initialize a new WebSocket object with given options.
     * @param {string}   url             Url of a django-tornado-websockets application
     * @param {Object}   options         Object options
     * @param {string}   options.host    Host used for connection
     * @param {integer}  options.port    Port user for connection
     * @param {bool}     options.secure  Using 'ws' or 'wss' protocol
     */
    function WebSocket(url, options) {
        if (url == null) {
            throw new ReferenceError('You must pass "url" parameter during "WebSocket" instantiation');
        }
        this.url = url;
        this.options = _.merge({
            host: 'localhost',
            port: 8000,
            secure: false
        }, options);
        return;
    }

    return WebSocket;

})();