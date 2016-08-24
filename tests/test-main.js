/*
 Configure RequireJS with Karma tests.
 Thanks to http://karma-runner.github.io/1.0/plus/requirejs.html
 */

var testFiles = []

// Let's found our test files
Object.keys(window.__karma__.files).forEach(function (file) {
    // A test file!
    if (/_test\.js$/.test(file)) {
        // Normalize paths to RequireJS module names.
        // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
        // then do not normalize the paths
        var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '')

        testFiles.push(normalizedTestModule)
    }
});

requirejs.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',

    // Configure our module
    paths: {
        // Should use ES6 version of our module or not
        'tornadowebsocket': window.__env__['USE_ES6'] == 'true' ? './dist/client-es6' : './dist/client',
    },

    // Ask Require.js to load these files (all our tests)
    deps: testFiles,

    // Run Karma when all deps are loaded
    callback: window.__karma__.start
})
