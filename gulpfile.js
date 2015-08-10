'use strict';
var debug = true;
var doLivereload = true;
var gulp = require('gulp');
var browserify = require('browserify');
var livereload = require('gulp-livereload');
var embedlr = require('gulp-embedlr');
var concatCss = require('gulp-concat-css');
var babelify = require("babelify");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var fs = require('fs');
var exorcist = require('exorcist');
var path = {
        main: 'app.js',
        vendor: 'vendor.js',
        src: './html/src',
        dist: './html/dist'
    };
var deps = ['mithril'];

try {if (fs.readFileSync('gulp.pid')){
  console.log('already running');process.exit();}} catch (e) {}

function errorHandler(err){console.log(err.message); this.emit('end'); }
function exitHandler (opt,err) { console.log('exiting'); del.sync('gulp.pid'); process.exit(); }
process.on('exit',  exitHandler);
process.on('SIGINT', exitHandler);

babelify = babelify.configure({ plugins: ["object-assign"] })

gulp.task('build:vendor', function () {
    var b = browserify({
        debug: debug
    })
    .require(require.resolve('mithril'), { expose: 'mithril' })
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
    .pipe(exorcist(path.dist + '/' + path.main + '.map'))
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
gulp.task('watch', function () {
    // if (doLivereload) {
    //     gulp.src("./html/index.html")
    //         .pipe(embedlr())
    //         .pipe(gulp.dest('./html/lr'));
    // }

    livereload.listen();
    gulp.watch([path.src + '/*'],['build:all']);
});
gulp.task('clean', function () {del(path.dist + '/*')});
gulp.task('default', ['build:all','watch']);

fs.writeFileSync('gulp.pid', process.pid);
