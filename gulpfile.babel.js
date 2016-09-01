import gulp from 'gulp'
import plumber from 'gulp-plumber'
import babel from 'gulp-babel'
import eslint from 'gulp-eslint'
import rename from 'gulp-rename'

const jsFiles = ['src/**/*.js']

gulp.task('scripts', () => {
    return gulp.src(jsFiles)
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message, error.location)
                this.emit('end')
            }
        }))

        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(gulp.dest('dist/'))

        .pipe(babel({
            presets: ['es2015']
        }))

        .pipe(rename(path => {
            path.basename = path.basename.replace('-es6', '')
        }))

        .pipe(gulp.dest('dist/'))
});

gulp.task('default', () => {
    gulp.watch(jsFiles, ['scripts'])
})
