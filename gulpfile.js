'use strict';
var debug = true;
var gulp = require('gulp');
var browserify = require('browserify');
var livereload = require('gulp-livereload');
var concatCss = require('gulp-concat-css');
var babelify = require("babelify");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var path = {
        main: 'app.js',
        vendor: 'vendor.js',
        src: './html/src',
        dist: './html/dist'
    };
var deps = [
        'mithril',
        'c'
    ];
function errorHandler(err){console.log(err.message); this.emit('end'); }
gulp.task('build:vendor', function () {
    var b = browserify({
        // require: deps,
        debug: debug
    })
    .require(require.resolve('mithril'), { expose: 'mithril' })
    .require(require.resolve('./html/vendor/c.js'), { expose: 'c' })
    .transform(babelify)
    .bundle()
    .on('error', errorHandler)
    .pipe(source(path.vendor))
    .pipe(buffer());


    b.pipe(gulp.dest(path.dist));
});
gulp.task('build:src', function () {
    var b = browserify({
        entries: path.src + '/' + path.main,
        debug: debug
    })
    .external(deps)
    .transform(babelify)
    .bundle()
    .on('error', errorHandler)
    .pipe(source(path.main))
    .pipe(buffer());
    // if (!debug)
    //     b.pipe(sourcemaps.init({loadMaps: true}))
    //     .pipe(uglify())
    //     .pipe(sourcemaps.write('./'));
    b.pipe(gulp.dest(path.dist))
    .pipe(livereload());
});
gulp.task('build:css', function () {
  return gulp.src('html/src/**.css')
    .pipe(concatCss("app.css"))
    .pipe(gulp.dest(path.dist));
        // .pipe(sourcemaps.init())
        // .pipe(sass().on('error', sass.logError))
        // .pipe(autoprefixer())
        // .pipe(concat('style.css'))
        // .pipe(sourcemaps.write('.'))
        // .pipe(livereload());
});
gulp.task('build:all',[
    'clean',
    'build:vendor',
    'build:css',
    'build:src'])
gulp.task('watch', function (){
    livereload.listen();
    gulp.watch([path.src + '/*'],['build:all']);
});
gulp.task('clean', function () {del(path.dist + '/*')});
gulp.task('default', ['build:all','watch']);
