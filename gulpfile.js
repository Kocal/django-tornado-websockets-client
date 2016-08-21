/**
 * Thanks to QuenchJS, gulpfile.js file generator
 * http://quenchjs.com/
 */

var gulp    = require('gulp'),
    plumber = require('gulp-plumber'),
    rename  = require('gulp-rename');
var babel = require("gulp-babel");
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var prettify = require('gulp-jsbeautifier');

var filesToWatch = [
    'src/lib/**/*.js',
    'src/*.js'
];

gulp.task('scripts', function () {
    return gulp.src(filesToWatch)
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message, error.location);
                this.emit('end');
            }
        }))
        .pipe(prettify({
            indent_size: 4,
            indent_with_tabs: false
        }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(concat('client-es2015.js'))
        .pipe(gulp.dest('dist/'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('client.js'))
        .pipe(gulp.dest('dist/'))
});

gulp.task('default', function () {
    gulp.watch(filesToWatch, ['scripts']);
});
