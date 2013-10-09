module.exports = function (grunt) {

    var pwpBanner = '/*! ==========================================\n' +
        ' * <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n' +
        ' * <%= pkg.author %>\n' +
        ' * <%= pkg.repository.url %>\n' +
        ' * Licensed under The BSD 2-Clause License\n' +
        ' * http://opensource.org/licenses/BSD-2-Clause\n' +
        ' * =========================================== */\n';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'js/*.js'],
            options: {
                jshintrc: '.jshintrc',
                ignores: [
                    'js/podlove-web-player.min.js',
                    'js/lib/hashchange.min.js',
                    'js/lib/zepto.js'
                ]
            }
        },
        uglify: {
            options: {
                banner: pwpBanner
            },
            build: {
                src: 'js/<%= pkg.name %>.js',
                dest: 'js/<%= pkg.name %>.min.js'
            }
        },
        sass: {                              // Task
            dist: {                            // Target
                options: {                       // Target options
                    style: 'compressed',
                    compass: true,
                    banner: pwpBanner
                },
                files: {
                    "css/pwp.css": "sass/podlove-web-player.scss"
                }
            },
            dev: {
                options: {                       // Target options
                    style: 'expanded',
                    compass: true,
                    lineNumbers: true
                },
                files: {
                    "css/pwp.css": "sass/podlove-web-player.scss"
                }
            }
        },
        watch: {
            options: {
                dateFormat: function (time) {
                    grunt.log.writeln('The watch finished in ' + time + 'ms at' + (new Date()).toString());
                    grunt.log.writeln('Waiting for more changes...');
                },
                livereload: true
            },
            sass: {
                files: ['sass/*.scss'],
                tasks: ['sass:dev']
            },
            /* watch and see if our javascript files change, or new packages are installed */
            scripts: {
                files: ['js/*.js'],
                tasks: ['jshint'],
                options: {
                    spawn: false
                }
            },
            /* watch our files for change, reload
            livereload: {
                files: ['sass/*.scss', 'js/podlove-web-player.js'],
                options: {
                    livereload: true
                }
            }
            * */
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('build', ['jshint', 'uglify', 'sass:dist']);
    grunt.registerTask('default', ['build']);
};
