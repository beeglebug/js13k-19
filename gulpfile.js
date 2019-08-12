const gulp = require('gulp')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const terser = require('gulp-terser')
const htmlreplace = require('gulp-html-replace')
const htmlSrc = require('gulp-html-src')
const zip = require('gulp-zip')
const imagemin = require('gulp-imagemin')
const cleanCSS = require('gulp-clean-css')

let outDir = 'dist'

gulp.task('clean', () => gulp
  .src(['dist/*', 'archive.zip'], { read: false })
  .pipe(clean())
)

// gulp.task('copy', ['clean'], () => gulp
//   .src(['src/style.css'])
//   .pipe(gulp.dest(outDir))
// )

gulp.task('compile', ['clean'], () => gulp
  .src('src/index.html')
  .pipe(htmlSrc())
  .pipe(concat('app.js'))
  .pipe(terser())
  .pipe(gulp.dest(outDir))
)

gulp.task('html', ['clean'], () => gulp
  .src('src/index.html')
  .pipe(htmlreplace({
    js: 'app.js',
    css: {
      src: gulp.src('src/style.css').pipe(cleanCSS()),
      tpl: '<style>%s</style>'
    }
  }))
  .pipe(gulp.dest(outDir))
)

gulp.task('zip', ['compile', 'html', 'crush'], () =>
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

gulp.task('build', ['clean', 'compile', 'html', 'crush', 'zip'])

gulp.task('default', ['build'])
