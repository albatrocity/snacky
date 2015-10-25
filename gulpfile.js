var gulp       = require('gulp');
var babel      = require('gulp-babel');
var concat     = require('gulp-concat');
var uglify     = require('gulp-uglify');
var stream     = require('streamqueue');
var bowerFiles = require('main-bower-files');
var sourcemaps = require("gulp-sourcemaps");

var paths = {
  src: {
    js:    ['src/**/*.js']
  },
  dest: {
    dir: 'public/javascripts',
    js: 'all.js'
  },
};

// Build

gulp.task('build', ['js']);

// Builds

gulp.task('index', function() {
  gulp.src(paths.src.index)
    .pipe(gulp.dest(paths.dest.dir));
});

gulp.task('js', function() {
  stream(
    {objectMode: true},
    gulp.src(bowerFiles()),
    gulp.src(paths.src.js)
      .pipe(sourcemaps.init())
      .pipe(babel())
  )
    .pipe(concat(paths.dest.js))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.dest.dir));
});

gulp.task('css', function() {
  gulp.src(paths.src.css)
    .pipe(concat(paths.dest.css))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dest.dir));
});

// Watch

gulp.task('watch', function() {
  // gulp.watch(paths.src.index, ['index']);
  gulp.watch(paths.src.js,    ['js']);
  // gulp.watch(paths.src.css,   ['css']);
});

// Default

gulp.task('default', ['watch']);
