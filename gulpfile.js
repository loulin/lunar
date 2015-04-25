var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var jscs = require('gulp-jscs');
var del = require('del');
var mocha = require('gulp-mocha');

gulp.task('clean', function(cb) {
  del('build/**/*.*', cb);
});

gulp.task('build', function() {
  return gulp.src(['lib/**/*.js'])
    .pipe(jscs())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

gulp.task('test', ['clean', 'build'], function() {
  return gulp.src('test/**/*.js', {
      read: false
    })
    .pipe(mocha());
});

gulp.task('default', ['clean', 'build']);