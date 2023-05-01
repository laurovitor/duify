var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    sass = require('gulp-sass')(require('sass')),
    meta = require('./package.json'),
    cleanCSS = require('gulp-clean-css');


var argv = require('minimist')(process.argv.slice(2));

var jsDir = 'src/js/',
    sassDir = 'src/sass/',
    fontsDir = 'src/fonts/',
    distDir = 'dist',
    banner = [
        '/**',
        ' * <%= name %> v<%= version %>',
        ' * <%= description %>',
        ' *',
        ' * (c) 2023 <%= author %>',
        ' */\n\n'
    ].join('\n'),
    umdDeps = {
        dependencies: function () {
            return [
                {
                    name: '$',
                    amd: 'jquery',
                    cjs: 'jquery',
                    global: 'jQuery',
                    param: '$'
                }
            ];
        }
    };

var onError = function (err) {
    $.util.beep();
    console.log(err.toString());
    this.emit('end');
};

gulp.task('fonts', function () {
    return gulp.src(fontsDir + '**/*')
        .pipe(gulp.dest(distDir + "/fonts"));
});

gulp.task('sass', function () {
    return gulp.src(sassDir + '*.scss')
        .pipe($.plumber({ errorHandler: onError }))
        .pipe(sass())
        .pipe($.autoprefixer())

        .pipe($.header(banner, meta))
        .pipe(gulp.dest(distDir + "/css"))

        .pipe($.if(!argv.dev, cleanCSS()))
        .pipe($.if(!argv.dev, $.rename(meta.name + '.min.css')))
        .pipe($.if(!argv.dev, gulp.dest(distDir + "/css")));
});

gulp.task('scripts', function () {
    return gulp.src([jsDir + '*.js'])
        .pipe($.plumber({ errorHandler: onError }))
        .pipe(gulp.dest(distDir + "/js"))
        .pipe($.umd(umdDeps))

        .pipe($.header(banner, meta))
        .pipe($.rename(meta.name + '.js'))
        .pipe(gulp.dest(distDir + "/js"))

        .pipe($.if(!argv.dev, $.uglify()))
        .pipe($.if(!argv.dev, $.header(banner, meta)))
        .pipe($.if(!argv.dev, $.rename(meta.name + '.min.js')))
        .pipe($.if(!argv.dev, gulp.dest(distDir + "/js")));
});

gulp.task('watch', function () {
    gulp.watch(jsDir + '**/*.js', gulp.series('scripts'));
    gulp.watch(sassDir + '**/*.scss', gulp.series('sass'));
});

//gulp.task('default', gulp.series('sass', 'scripts', 'fonts', 'watch'));
gulp.task('build', gulp.series('sass', 'scripts', 'fonts'));
