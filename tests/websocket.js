/**
 * Created by kocal on 17/05/16.
 */

describe('Tests for WebSocket class constructor', function() {

    it('should raise a ReferenceError exception because there is no URL parameter', function() {
        expect(function() {
            return new WebSocket
        }).toThrowError(ReferenceError, 'You must pass "url" parameter during "WebSocket" instantiation')
    });

    it('should be using default options', function() {
        ws = new WebSocket('my_app');

        expect(ws.options).toEqual({
            host: 'localhost',
            port: 8000,
            secure: false
        });
    });

    it('should be merging options', function() {
        ws = new WebSocket('my_app', {
            host: 'my.host.fr',
            port: 8080
        });

        expect(ws.options).toEqual({
            host: 'my.host.fr',
            port: 8080,
            secure: false
        });
    });

    it('should be overide options', function() {
        ws = new WebSocket('my_app', {
            host: 'my.host.fr',
            port: 8080,
            secure: true
        });

        expect(ws.options).toEqual({
            host: 'my.host.fr',
            port: 8080,
            secure: true
        });
    });
});
