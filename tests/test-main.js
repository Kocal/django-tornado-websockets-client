/*
 Configure RequireJS with Karma tests.
 Thanks to http://karma-runner.github.io/1.0/plus/requirejs.html
 */

var testFiles = []
var requirejsPaths = {
    'tornadowebsocket': './dist/tornadowebsocket',
    'progressbar': './dist/modules/progress_bar',
}

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
})

if (window.__env__['USE_ES6'] == 'true') {
    for (var path in requirejsPaths) {
        requirejsPaths[path + '-es6'] = requirejsPaths[path] + '-es6'
        delete requirejsPaths[path]
    }
}

window.__env__['dependencies'] = Object.keys(requirejsPaths)

console.log('RequireJS files :', requirejsPaths)
console.log('Dependencies are :', window.__env__['dependencies'])

requirejs.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',

    // Configure our module
    paths: requirejsPaths,

    // Ask Require.js to load these files (all our tests)
    deps: testFiles,

    // Run Karma when all deps are loaded
    callback: window.__karma__.start
})
