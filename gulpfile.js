/**
 * Thanks to QuenchJS, gulpfile.js file generator
 * http://quenchjs.com/
 */

var gulp    = require('gulp'),
    plumber = require('gulp-plumber'),
    rename  = require('gulp-rename');
var gulpif = require('gulp-if');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

gulp.task('scripts', function () {
    return gulp.src(['src/vendor/**/*.js', 'src/**/*.coffee'])
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(gulpif(/[.]coffee$/, coffee({ bare: true })))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'))
});

gulp.task('default', function () {
    gulp.watch(['src/vendor/**/*.js', 'src/**/*.coffee'], ['scripts']);
});
