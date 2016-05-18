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
    });
   
    // bind events
    ws.on('open', function(socket) {
        console.log('Connection: OK');
    
        socket.on('an_event', function (data) {
            console.log('Got some data from an_event', data);
        });
    
        // emit 'my_event' to current user
        socket.emit('my_event', {
            some: 'data'
        });
        
        // emit 'my_other_event' to all users connected to '/my_app' application
        ws.emit('my_event', {
            some: 'data'
        });
    });
    
    ws.on('error', function(error) {
        console.error(error);
    });
   
    // connect
    ws.connect();
```

Run tests
---------
1. Setup your `django-tornado-websockets` WebSocket application and [run Tornado server](http://django-tornado-websockets.readthedocs.io/en/stable/usage.html#run-tornado-server),
2. `$ npm install`
3. `$ npm test`

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
 
