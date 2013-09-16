module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: ['src/*.js'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': [
            'dist/<%= pkg.name %>-<%= pkg.version %>.js']
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/*.js', 'test/spec/*.js']
    },
    bower: {
      install: {
        options: {
          targetDir: './test/lib',
          cleanup: true
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    watch: {
      scripts: {
        files: 'src/*.js',
        tasks: ['test']
      },
      tests: {
        files: 'test/spec/*.js',
        tasks: ['test']
      }
    },


  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('test', ['bower', 'jshint', 'karma']);
  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('default', ['build']);

};
