
var gulp = require('gulp');
var noprotocol = require('gulp-noprotocol');
var livereload = require('gulp-livereload');

gulp.task('build', function () {

    return gulp
        .src(['src/keyboard.module.js', 'src/**/*.js']) // All js files, but keyboard.module.js first.
        .pipe(noprotocol.angular({
            output: 'keyboard.js'
        })).pipe(gulp.dest('dist/'));
});
gulp.task('watch', ['build'], function () {
    livereload.listen();
    gulp.watch('src/**/*.js', ['build']);
    gulp.watch(['dist/*.js', 'Examples/*.html']).on('change', livereload.changed);
});

gulp.task('default', ['build']);