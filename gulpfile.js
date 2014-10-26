'use strict';
var gulp = require('gulp');
var noprotocol = require('gulp-noprotocol');
var livereload = require('gulp-livereload');

/**
 * Create the angular-keyboard.js and angular-keyboard.min.js files.
 */
gulp.task('build', function () {
    return gulp
        .src(['src/keyboard.module.js', 'src/**/*.js']) // All *.js files, but keyboard.module.js first.
        .pipe(noprotocol.angular({
            output: 'keyboard.js'
        })).pipe(gulp.dest('bower-angular-keyboard/'));
});
/**
 * Watch for file-changes, start a livereload server and rebuild on every change.
 */
gulp.task('watch', ['build'], function () {
    livereload.listen();
    gulp.watch('src/**/*.js', ['build']);
    gulp.watch(['bower-angular-keyboard/*.js', 'minisite/**/*.html']).on('change', livereload.changed);
});

gulp.task('default', ['build']);