'use strict';
var gulp = require('gulp');
var noprotocol = require('gulp-noprotocol');
var livereload = require('gulp-livereload');

gulp.task('build', function () {
    return gulp
        .src(['src/keyboard.module.js', 'src/**/*.js']) // All *.js files, but keyboard.module.js first.
        .pipe(noprotocol.angular({
            output: 'keyboard.js'
        })).pipe(gulp.dest('bower-angular-keyboard/'));
});
gulp.task('watch', ['build'], function () {
    livereload.listen();
    gulp.watch('src/**/*.js', ['build']);
    gulp.watch(['bower-angular-keyboard/*.js', 'Examples/*.html']).on('change', livereload.changed);
});

gulp.task('default', ['build']);