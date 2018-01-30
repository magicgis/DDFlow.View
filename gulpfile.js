var gulp = require('gulp');
// var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var minifyCSS  = require('gulp-minify-css');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var minifyHtml= require("gulp-minify-html");

// gulp.task('sass', function(){   //打包sass
//   return gulp.src('app/scss/**/*.scss')
//     .pipe(sass()) // Converts Sass to CSS with gulp-sass
//     .pipe(gulp.dest('app/css'))
//     .pipe(browserSync.reload({
//       stream: true
//     }))
// });

gulp.task('js',function() {

    gulp.src('src/**/*.js')

    .pipe(uglify())//压缩

    .pipe(gulp.dest('dist'));

});

gulp.task('css', function () {
    gulp.src('src/**/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/css'))
})

gulp.task('minify-html',function() {

      gulp.src('src/**/*.html')//要压缩的html文件
     .pipe(gulp.dest('dist'));

});


gulp.task('images', function(){
  return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('dist/images'))
});

gulp.task('clean', function(callback) {
  del('dist');
  return cache.clearAll(callback);
});

gulp.task('watch',['browserSync'],function(){   //我们可以在watch任务之前告知Gulp，先把browserSync和Sass任务执行了再说。
  // gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('src/**/*.html', browserSync.reload);
  gulp.watch('src/js/**/*.js', browserSync.reload);
  // Other watchers
});

gulp.task('browserSync', function() {  //浏览器热加载
  browserSync({
    server: {
      baseDir: 'src'
    },
  })
});

gulp.task('build', function (callback) {
  runSequence('clean',['minify-html','js','images','css'],callback)
});

gulp.task('default', function (callback) {
  runSequence(['browserSync', 'watch'],
    callback
  )
});