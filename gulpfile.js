const gulp = require('gulp')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const terser = require('gulp-terser')
const htmlreplace = require('gulp-html-replace')
const zip = require('gulp-zip')
const cleanCSS = require('gulp-clean-css')

gulp.task('clean', () => gulp
  .src(['dist/*', 'archive.zip'], { read: false, allowEmpty: true })
  .pipe(clean())
)

gulp.task('compile', () => gulp
  .src([
    'src/js/module.js',
    'src/js/index.js'
  ])
  .pipe(concat('app.js'))
  .pipe(terser({ mangle: true, toplevel: true }))
  .pipe(gulp.dest('dist'))
)

gulp.task('html', () => gulp
  .src('src/index.html')
  .pipe(htmlreplace({
    js: 'app.js',
    css: {
      src: gulp.src('src/style.css').pipe(cleanCSS()),
      tpl: '<style>%s</style>'
    }
  }))
  .pipe(gulp.dest('dist'))
)

gulp.task('zip', () =>
  gulp.src('dist/*')
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest('./'))
)

gulp.task('build', gulp.series('clean', gulp.parallel('compile', 'html'), 'zip'))
