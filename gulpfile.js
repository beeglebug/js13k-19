const { task, series, parallel, src, dest } = require('gulp')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const terser = require('gulp-terser')
const htmlreplace = require('gulp-html-replace')
const zip = require('gulp-zip')
const removeCode = require('gulp-remove-code')
const cleanCSS = require('gulp-clean-css')
const htmlSrc = require('./gulp/html-src')
const imagemin = require('gulp-imagemin')

task('clean', () =>
  src(['dist/*', 'archive.zip'], { read: false, allowEmpty: true })
    .pipe(clean()),
)

task('compile', () =>
    src('src/index.html')
    .pipe(htmlSrc())
    .pipe(concat('app.js'))
    .pipe(removeCode({ production: true }))
    .pipe(terser({
      mangle: true,
      toplevel: true,
    }))
    .pipe(dest('dist')),
)

task('images', () =>
  src('src/*.png')
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 5 }),
    ]))
    .pipe(dest('dist')),
)

task('html', () =>
  src('src/index.html')
    .pipe(htmlreplace({
      js: 'app.js',
      css: {
        src: src('src/style.css').pipe(cleanCSS()),
        tpl: '<style>%s</style>',
      },
    }))
    .pipe(dest('dist')),
)

task('zip', () => src('dist/*')
  .pipe(zip('archive.zip'))
  .pipe(dest('./')),
)

task('build', series('clean', parallel('compile', 'images', 'html'), 'zip'))
