var path = require('path');

module.exports = function (grunt) {
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    config: config,
    connect: {
      server: {
        options: {
          port: process.env.PORT || 80,
          hostname: 'localhost',
          base: 'demo/',
          open: true,
          keepalive: true,
          livereload: true
        }
      }
    },
    crx: {
      production: {
        src: 'temp/',
        dest: '<%= config.dist %>/solvency-verifier.crx',
        privateKey: '~/.ssh/chrome-apps.pem'
      }
    },
    handlebars: {
      compile: {
        options: {
          namespace: 'templates',
          processName: function (filePath) {
            return path.basename(filePath, '.hbs');
          }
        },
        files: {
          '<%= config.app %>/js/templates.js': '<%= config.app %>/templates/*'
        }
      }
    },
    watch: {
      app: {
        files: [
          '<%= config.app %>/manifest.json',
          '<%= config.app %>/**/*.css',
          '<%= config.app %>/**/*.js',
          '<%= config.app %>/**/*.html'
        ],
        options: {
          livereload: 35728 //extension
        }
      },
      handlebars: {
        files: [
          '<%= config.app %>/templates/*.hbs',
        ],
        tasks: [ 'handlebars:compile' ],
        options: {
          livereload: 35728
        }
      },
      demo: {
        files: [
          'demo/*'
        ],
        options: {
          livereload: true
        }
      }
    },
    exec: {
      copyToTemp: {
        cmd: 'rm -rf temp; cp -R <%= config.app %> temp'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/*'
          ]
        }]
      },
      temp: {
        files: [ {
          src: [ './temp' ]
        }]
      }
    }
  });

  // Don't use livereload in distributed Chrome extension
  grunt.registerTask('fixmanifest', function() {
    var file = 'temp/manifest.json';
    var manifest = grunt.file.readJSON(file);
    var scripts = manifest.background.scripts;
    var s = [];
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i] === 'js/livereload.js') continue;
      s.push(scripts[i]);
    }
    manifest.background.scripts = s;
    grunt.file.write('temp/manifest.json', JSON.stringify(manifest, null, 2));
  });

  grunt.registerTask('build', [
    'clean:dist',
    'exec:copyToTemp',
    'fixmanifest',
    'crx:production',
    'clean:temp'
  ]);

  grunt.registerTask('default', [
    'watch'
  ]);
};
