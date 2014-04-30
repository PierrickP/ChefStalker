var gulp = require('gulp'),
less = require('gulp-less');

gulp.task('default', function () {
    gulp.src(['./public/style.less'])
        .pipe(less())
        .pipe(gulp.dest('./public'));
});
