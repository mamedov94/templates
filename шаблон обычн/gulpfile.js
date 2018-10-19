var gulp       = require('gulp'), // Gulp
	less         = require('gulp-less'), // Less пакет,
	browserSync  = require('browser-sync'), // Browser Sync
	concat       = require('gulp-concat'), // gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglifyjs'), // gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Пакет для минификации CSS
	rename       = require('gulp-rename'), // Библиотека для переименования файлов
	del          = require('del'), // Библиотека для удаления файлов и папок
	imagemin     = require('gulp-imagemin'), // Библиотека для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Библиотека для работы с PNG
	mozjpeg    	 = require('imagemin-mozjpeg'),
	cache        = require('gulp-cache'), // Библиотека кеширования
	autoprefixer = require('gulp-autoprefixer'),// Автоматическое добавление префиксов
	babel			 =	require('gulp-babel'), // Babel
	pug 			 = require('gulp-pug'); // Pug

gulp.task('less', function() { // Создаем таск Less
	return gulp.src('app/less/**/*.less') // Берем источник
		.pipe(less()) // Преобразуем Less в CSS посредством gulp-less
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest('app/css')) // Выгружаем результаты в папку app/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('pug', function() {
	return gulp.src('app/pug/**/*.pug')
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest('app'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('babel', function() {
	return gulp.src('app/jsx/**/*.jsx')
		.pipe(babel({
			presets: ["env", "react"]
		}))
		.pipe(gulp.dest('app/js'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('scripts', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
		'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
		])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-libs', ['less'], function() {
	return gulp.src('app/css/libs.css') // Выбираем файл для минификации
		.pipe(cssnano()) // Сжимаем
		.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
		.pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('watch', ['browser-sync', 'pug', 'css-libs', 'scripts', 'babel'], function() {
	gulp.watch('app/less/**/*.less', ['less']); // Наблюдение за less файлами в папке less
	gulp.watch('app/pug/**/*.pug', ['pug']); // Наблюдение за PUG файлами в корне проекта
	gulp.watch('app/_partials/**/*.pug', ['pug']);
	gulp.watch('app/_layouts/**/*.pug', ['pug']);
	gulp.watch('app/js/main.js', browserSync.reload);
	gulp.watch('app/jsx/**/*.jsx', ['babel']);
});

gulp.task('clean', function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin([
			pngquant(),
			mozjpeg({
				progressive: true
			})
		],{
			verbose: true
		})))
		.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

// gulp.task('img', function() {
// 	return gulp.src('app/img/**/*') // Берем все изображения из app
// 		.pipe(cache(imagemin({
// 			interlaced: true,
// 			progressive: true,
// 			svgoPlugins: [{removeViewBox: false}],
// 			use: [pngquant()]
// 		})))
// 		.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
// });

gulp.task('build', ['clean', 'img', 'less', 'pug', 'scripts', 'babel'], function() {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/css/main.css',
		'app/css/normalize.css',
		'app/css/bootstrap.min',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('default', ['watch']);
