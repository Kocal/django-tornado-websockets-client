import gulp from 'gulp';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import eslint from 'gulp-eslint';
import prettify from 'gulp-jsbeautifier';

const jsFiles = [
    'src/*.js'
];

gulp.task('scripts', () => {
    return gulp.src(jsFiles)
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

gulp.task('default', () => {
    gulp.watch(jsFiles, ['scripts']);
});
