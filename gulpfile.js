var gulp = require('gulp');
var noprotocol = require('gulp-noprotocol');
var livereload = require('gulp-livereload');

/**
 * Create the angular-keyboard.js and angular-keyboard.min.js files.
 */
gulp.task('build', function () {
    gulp
        .src(['src/keyboard.module.js', 'src/**/*.js']) // All *.js files, but keyboard.module.js first.
        .pipe(noprotocol.angular({
            bundle: 'keyboard.min.js'
        }))
        .pipe(gulp.dest('dist/'));

    gulp
        .src(['src/keyboard.module.js', 'src/**/*.js'])
        .pipe(noprotocol.angular({
            bundle: 'keyboard.js',
            minify: false
        }))
        .pipe(gulp.dest('dist/'));
});
/**
 * Watch for file-changes, start a livereload server and rebuild on every change.
 */
gulp.task('watch', ['build'], function () {
    livereload.listen();
    gulp.watch('src/**/*.js', ['build']);
    gulp.watch(['dist/*.js', 'demos/**/*.html']).on('change', livereload.changed);
});

gulp.task('default', ['build']);