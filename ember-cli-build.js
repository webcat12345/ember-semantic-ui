/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var funnel = require('ember-cli/node_modules/broccoli-funnel');

module.exports = function (defaults) {
  var app = new EmberApp(defaults, {
    dotEnv: {
      clientAllowedKeys: ['DROPBOX_KEY'],
      path: {
        development: '.env.deploy.development',
        test: '.env.deploy.test',
        production: '.env.deploy.production',
        staging: '.env.deploy.staging'
      }
    }
  });

  app.import('bower_components/bootstrap/dist/js/bootstrap.min.js');
  app.import('bower_components/bootstrap/dist/css/bootstrap.min.css');
  app.import('bower_components/bootstrap/dist/css/bootstrap.css.map', {
    destDir: 'assets'
  });

  app.import('bower_components/moment/min/moment.min.js');
  app.import('bower_components/bootstrap-daterangepicker/daterangepicker.js');
  app.import('bower_components/bootstrap-daterangepicker/daterangepicker-bs3.css');


  //app.import('bower_components/jquery.csv-0.71.min/index.js');
  //app.import('bower_components/highcharts-release/highcharts.js');
  app.import('bower_components/highstock/highstock-all.js');
  app.import('bower_components/highcharts-release/highcharts-more.js');
  app.import('bower_components/highcharts-release/modules/heatmap.js');
  app.import('bower_components/highcharts-release/modules/treemap.js');
  app.import('bower_components/highchartsColor/index.js');


  app.import('bower_components/highslide/index.js');
  app.import('bower_components/highslide_conf/index.js');
  app.import('bower_components/highslide_css/index.css');

  app.import('bower_components/bootstrap-select/dist/css/bootstrap-select.min.css');
  app.import('bower_components/bootstrap-select/dist/js/bootstrap-select.min.js');
  var bootstrap = new funnel('bower_components/bootstrap/fonts', {
    srcDir: '/',
    destDir: 'fonts'
  });

  app.import('bower_components/metisMenu/dist/metisMenu.min.css');
  app.import('bower_components/metisMenu/dist/metisMenu.min.js');

  app.import('bower_components/startbootstrap-sb-admin-2/dist/css/timeline.css');
  app.import('bower_components/startbootstrap-sb-admin-2/dist/css/sb-admin-2.css');
  app.import('bower_components/startbootstrap-sb-admin-2/dist/js/sb-admin-2.js');

  app.import('bower_components/morrisjs/morris.css');
  app.import('bower_components/morrisjs/morris.min.js');

  app.import('bower_components/font-awesome/css/font-awesome.min.css');

  //app.import('bower_components/jquery/dist/jquery.min.js');

  app.import('bower_components/datatables/media/js/jquery.dataTables.min.js');
  app.import('bower_components/datatables/media/css/jquery.dataTables.min.css');

  var datatablesAssets = new funnel('bower_components/datatables/media/images', {
    srcDir: '/',
    include: ['**/*'],
    destDir: '/images'
  });
  app.import('bower_components/datatables-plugins/integration/bootstrap/3/dataTables.bootstrap.css');
  app.import('bower_components/datatables-plugins/integration/bootstrap/3/dataTables.bootstrap.min.js');
  var dtpluginImages = new funnel('bower_components/datatables-plugins/integration/bootstrap/images', {
    srcDir: '/',
    include: ['**/*'],
    destDir: '/images'
  });
  app.import('bower_components/semantic-ui/dist/semantic.min.css');
  app.import('bower_components/semantic-ui/dist/semantic.min.js');
  app.import('bower_components/tablesort/index.js');

  app.options.inlineContent = {'usersnap': {file: './private_components/usersnap.js'}};
  if (app.env === 'production' || app.env === 'staging') {
    app.options.inlineContent['newRelic'] = {file: './private_components/newRelic.js'};
    app.options.inlineContent['inspectlet'] = {file: './private_components/inspectlet.js'};
  }

  // app.options.inlineContent['font'] = {file: './private_components/font.js'};

  return app.toTree([bootstrap]);
  //return mergeTrees([app.toTree(bootstrap), extraAssets, ionAssets], {overwrite: true});
  //return app.toTree();
};
