django-tornado-websockets-client
================================

Client-side library for [django-tornado-websockets](https://github.com/Kocal/django-tornado-websockets) project.
Require lodash to works.

Installation
-------------
```bash
$ npm install
```

Usage
-----
1. Link `dist/tornado_websocket.js` file in your HTML page,
2. Or link `dist/main[.min].js` file for lodash and tornado_websockets support,

```js
    var ws = new TornadoWebSocket('/my_app', {
        // options
        host: 'my_host.fr', // 'localhost' by default
        port: 8888,         // '8000' by default
        secure: true,       // 'false' by default
    });
   
    // bind events
    ws.on('open', () =>
        console.log('Connection: OK');
    
        ws.emit('my_event', { message: 'A message.' });
    
        ws.on('an_event', data => {
            console.log('Got some data from an_event', data);
            console.log('Foo value =', data.foo);
        });
    });
    
    ws.on('close', (reason, event) => {
        console.log('Connection: CLOSED');
        console.log('Reason: ', reason, event);
    });
    
    ws.on('error', event => {
        console.log('Connection: ERROR');
        console.error(event);
    });
```

Run unit tests
--------------
1. Setup your `django-tornado-websockets` WebSocket application and [run Tornado server](http://django-tornado-websockets.readthedocs.io/en/stable/usage.html#run-tornado-server),
2. `$ npm install`,
3. `$ npm test`.

Run examples
------------
Examples are made with ES2016, so use a modern browser please. :^)

1. `cd examples`,
2. `python -m SimpleHTTPServer 8000` or `php -S 0.0.0.0:8000`,
3. Open your browser at http://localhost:8000 and profit.

Gulp
----
To compile CoffeeScript:
```bash
$ gulp scripts
```

To watch CoffeeScript file and run « scripts » task:
```bash
$ gulp
```
 
