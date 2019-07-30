const gulp = require('gulp')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const uglify = require('gulp-uglify-es').default
const htmlreplace = require('gulp-html-replace')
const htmlSrc = require('gulp-html-src')
const removeCode = require('gulp-remove-code')
const zip = require('gulp-zip')
const imagemin = require('gulp-imagemin')

let outDir = 'dist'

gulp.task('clean', () => gulp
  .src(['dist/*', 'archive.zip'], { read: false })
  .pipe(clean())
)

gulp.task('copy', ['clean'], () => gulp
  .src(['src/style.css'])
  .pipe(gulp.dest(outDir))
)

gulp.task('compile', ['clean'], () => gulp
  .src('src/index.html')
  .pipe(htmlSrc())
  .pipe(concat('app.js'))
  .pipe(removeCode({ production: true }))
  .pipe(uglify({ toplevel: true }))
  .pipe(gulp.dest(outDir))
)

gulp.task('html', ['clean'], () => gulp
  .src('src/index.html')
  .pipe(removeCode({ production: true }))
  .pipe(htmlreplace({ js: 'app.js' }))
  .pipe(gulp.dest(outDir))
)

gulp.task('zip', ['copy', 'compile', 'html', 'crush'], () =>
  gulp.src('dist/*')
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest(''))
)

gulp.task('crush', () =>
  gulp.src('src/*.png')
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 7 })
    ]))
    .pipe(gulp.dest(outDir))
)

gulp.task('build', ['clean', 'copy', 'compile', 'html', 'crush', 'zip'])

gulp.task('default', ['build'])
