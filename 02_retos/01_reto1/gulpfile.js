var gulp = require("gulp"); // importamos la librería gulp
var sass = require("gulp-sass");
var notify = require("gulp-notify");
var browserSync = require("browser-sync").create();
var gulpImport = require("gulp-html-import");
var tap = require("gulp-tap");
var browserify = require("browserify");
var buffer = require("gulp-buffer");
var sourcemaps = require("gulp-sourcemaps");
var htmlmin = require("gulp-htmlmin");
var uglify = require("gulp-uglify");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var imagemin = require("gulp-imagemin");
var responsive = require("gulp-responsive");

// compilar sass
gulp.task("sass", function(){
    gulp.src("src/scss/style.scss")
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", function(error){
            return notify().write(error);
        }))
        .pipe(postcss([
            autoprefixer(),
            cssnano()
        ]))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("dist/css/"))
        .pipe(browserSync.stream())
        .pipe(notify("SASS Compilado 🤘🏻"))
});

// copiar e importar html
gulp.task("html", function(){
    gulp.src("src/*.html")
        .pipe(gulpImport("src/components/"))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream())
        .pipe(notify("HTML importado"));
});

// compilar y generar un único javascript
gulp.task("js", function(){
    gulp.src("src/js/main.js")
        .pipe(tap(function(file){ // tap nos permite ejecutar una función por cada fichero seleccionado en gulp.src
            // reemplazamos el contenido del fichero por lo que nos devuelve browserify pasándole el fichero
            file.contents = browserify(file.path, {debug: true}) // creamos una instancia de browserify en base al archivo
                            .transform("babelify", {presets: ["es2015"]}) // traduce nuestro codigo de ES6 -> ES5
                            .bundle() // compilamos el archivo
                            .on("error", function(error){ // en caso de error, mostramos una notificación
                                return notify().write(error);
                            });
        }))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest("dist/js/"))
        .pipe(browserSync.stream())
        .pipe(notify("JS Compilado"));
});

gulp.task("img", function(){
    gulp.src("src/images/*")
        .pipe(imagemin())
        .pipe(gulp.dest("dist/images/"))
});

// definimos la tarea por defecto
gulp.task("default", ["img", "html", "sass", "js"], function(){

    browserSync.init({
		server: "./dist/",
		startPath: "index.html"
	});

    gulp.watch(["src/scss/*.scss", "src/scss/**/*.scss"], ["sass"]);
    gulp.watch(["src/*.html", "src/**/*.html"], ["html"]);
    gulp.watch(["src/js/*.js", "src/js/**/*.js"], ["js"]);
});