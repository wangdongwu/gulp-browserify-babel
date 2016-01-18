'use strict';

import gulp from 'gulp';
import less from 'gulp-less';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';

import watchify from 'watchify';
import browserify from 'browserify';
import babel from 'babelify';
import source from 'vinyl-source-stream';
import vbuffer from 'vinyl-buffer';
import gutil from 'gulp-util';

import glob from 'glob';
import es from 'event-stream';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import streamify from 'gulp-streamify';
import livereload from 'gulp-livereload';
import nodemon from 'gulp-nodemon';


const paths = {
	less : 'less/',
	dest : 'build/'
};

gulp.task('less',() => {

	return gulp.src(`${paths.less}**/*.less`)
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(autoprefixer({map: true,browsers: ["last 105 versions"]}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(`${paths.dest}css/`));	

});

function build() {
  const bundler = browserify({
  	entries: 'js/index.js',
    debug: true,
    transform: [babel]
  });

  return bundler.bundle()
    .pipe(source('compiled.js'))
    .pipe(vbuffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${paths.dest}`));
}

gulp.task('build', build);

gulp.task('glob',function(done){
	glob('./js/**/*.js',function(err,files){
		if(err) done(err);

		var tasks = files.map(function(entry) {
            return browserify(entry)
                .bundle()
                .pipe(source(entry))
                .pipe(gulp.dest(`${paths.dest}`))
                .pipe(streamify(uglify()))
                .pipe(rename({
                    extname: '.min.js'
                }))
                .pipe(gulp.dest(`${paths.dest}`));
            });
		
        es.merge(tasks).on('end', done);

	})
});
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(['js/**']).on('change', function (file) {
        gulp.task('glob');
         nodemon({
            script: 'js/test.js'
        }).on('restart', function () {
            livereload.changed(__dirname);
        });
        //livereload.changed(file.path);
    })
});