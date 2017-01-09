const gulp = require('gulp'),
    clean = require('gulp-clean'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    notify = require('gulp-notify');


const path = {
        root: 'src/',
        dist: 'dist/',
        scss: 'src/scss/*.scss',
        es6: 'src/es6/**/*.js',
        img: 'src/img/**/*.{jpg,gif,png,ico}',
        html: 'src/**/*.html'
    }
    // css


gulp.task('css', () => {
    return gulp.src(path.scss)
        .pipe(sass())
        .pipe(gulp.dest(path.root + 'css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', '>1%', 'IOS 7'],
            cascade: true,
            remove: true
        }))
        .pipe(gulp.dest(path.root + 'css'))
        .pipe(minifycss())
        .pipe(gulp.dest(path.dist + 'css'))
        .pipe(notify({ message: 'css样式编译压缩完毕' }))
});

gulp.task('js', () => {
    return gulp.src(path.es6)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(path.root + 'js'))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(gulp.dest(path.dist + 'js'))
        .pipe(notify({ message: 'js编译压缩完毕' }))
})
gulp.task('img', () => {
    return gulp.src(path.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.dist + 'img'))
        .pipe(notify({ message: '图片压缩完毕' }));
})
gulp.task('html', () => {
    return gulp.src(path.html)
        .pipe(htmlmin({
            removeComments: true, //清除HTML注释
            collapseWhitespace: true, //压缩HTML
            collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
            removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
            minifyJS: true, //压缩页面JS
            minifyCSS: true //压缩页面CSS
        }))
        .pipe(gulp.dest(path.dist))
        .pipe(notify({ message: 'html文件压缩完毕' }))
});
gulp.task('clean', () => {
    return gulp.src(path.dist, { read: false })
        .pipe(clean());
})
gulp.task('default', ['clean'], () => {
    gulp.start(['css', 'js', 'img', 'html'])
})
gulp.task('watch', () => {
    gulp.watch(path.scss, ['css']);
    gulp.watch(path.es6, ['js']);
    gulp.watch(path.img, ['img']);
    gulp.watch(path.html, ['html']);
})