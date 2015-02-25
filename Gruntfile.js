module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            base: {
                src: ['utils/*.ts', 'core/*.ts', 'render/*.ts'],
                dest: 'build/<%= pkg.name %>.js',
                options: {
                    target: 'es5',
					sourceMap: true,
					declaration: true
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            },
            plugins: {
                options: {
                    banner: ''
                },
                
                files: [{
                    expand: true,
                    src: '**/*.js',
                    dest: 'build',
                    cwd: 'plugins'
                }]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['typescript', 'uglify']);

};