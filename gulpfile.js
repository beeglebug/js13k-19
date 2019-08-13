const { task, series, src, dest, watch } = require('gulp')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const terser = require('gulp-terser')
const htmlreplace = require('gulp-html-replace')
const zip = require('gulp-zip')
const cleanCSS = require('gulp-clean-css')

task('clean', () =>
  src(['dist/*', 'archive.zip'], { read: false, allowEmpty: true })
  .pipe(clean())
)

task('compile', () =>
  src([
    'src/js/module.js',
    'src/js/index.js'
  ])
  .pipe(concat('app.js'))
  .pipe(terser({ mangle: true, toplevel: true }))
  .pipe(dest('dist'))
)

task('html', () =>
  src('src/index.html')
  .pipe(htmlreplace({
    js: 'app.js',
    css: {
      src: src('src/style.css').pipe(cleanCSS()),
      tpl: '<style>%s</style>'
    }
  }))
  .pipe(dest('dist'))
)

task('zip', () => src('dist/*')
  .pipe(zip('archive.zip'))
  .pipe(dest('./'))
)

task('build', series('clean', 'compile', 'html', 'zip'))

task('watch', () => watch('src/*', series('clean', 'compile', 'html')))
