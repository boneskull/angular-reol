'use strict';

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> Decipher, Inc.;' +
        ' Licensed <%= pkg.license %> */',
        sourceMaps: true
      },
      min: {
        files: {
          'angular-reol.min.js': 'angular-reol.js'
        }
      }
    },
    jshint: {
      all: ['<%= pkg.main %>', 'spec/*.spec.js']
    },
    bower: {
      install: {
        options: {
          targetDir: './support'
        }
      }
    },
    karma: {
      options: {
        files: [
          'support/angular/angular.js',
          'support/angular-mocks/angular-mocks.js',
          '<%= pkg.main %>',
          'test/*.spec.js'
        ],
        frameworks: ['jasmine'],
        reporters: ['story'],
        browsers: ['PhantomJS']
      },
      continuous: {
        singleRun: true
      },
      dev: {
        background: true,
        singleRun: false
      }
    },
    watch: {
      scripts: {
        files: [
          '<%= pkg.main %>',
          'test/*.spec.js'
        ],
        tasks: ['jshint', 'karma:dev:run']
      }
    },
    devUpdate: {
      main: {
        updateType: 'prompt'
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-dev-update');


  grunt.registerTask('test', ['bower', 'jshint', 'karma:continuous']);
  grunt.registerTask('build', ['uglify']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('dev', ['bower', 'karma:dev:start', 'watch']);

};
