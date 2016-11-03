import Ember from 'ember';
import config from './config/environment';
import GooglePageview from './mixins/google-pageview';

var Router = Ember.Router.extend(GooglePageview, {
  location: config.locationType
});

Router.map(function () {
  this.route('login');
  this.resource('loggedin', {path: "/secure/"}, function () {
    this.route('oauthcallback');
    this.resource('datasetroot', {path: "/d/:dataset_id"}, function () {
      this.resource('analysis', function () {
        this.route('bookmarks');
        this.route('adhocwhy');

      });
      this.resource('chart', function () {
        this.route('time_view');
        this.route('advanced_chart');
        this.route('percentage_chart');
        this.route('abtest');
        this.route('optimize');
        this.route('funnel');
        this.route('retention');
        this.route('session_view');
        this.route('advanced_query');
        this.route('dashboard_demo');
        this.route('dashboard_demo2');
      });

      this.resource('apps', function () {
        this.route('profile');
        this.route('funnel');
        this.route('feature');
        this.route('retention');
      });

      this.resource('channels', function () {
        this.route('channel', {path: ":feed_id"}, function () {
          this.route('feed');
          this.route('insights');
          this.route('create');
          this.route('overview');
        });
        this.route('create');
      });

      this.route('create');

      this.resource('compare', function () {
        this.route('create');
        this.resource('compare.edit', {path: "/edit/:why_id"});
        this.resource('compare.explain', {path: "/explain"}, function () {
          this.route('home');
          this.route('chart');
          this.route('bars');
        });
      });
      this.resource('patterns');
      this.resource('dashboard');


      this.resource('schema', function () {

        this.resource('users');

        this.resource('schema.tables', {path: "/tables/"}, function () {
          this.route('table', {path: "/table/:table_id"});
        });
        this.route('whydims');
        this.route('dimgroups');
        this.route('metricgroups');
        this.resource('factors', function () {
          this.resource('factors.metric', {path: "/metric/:metric_id"});
          this.resource('factors.dimension', {path: "/dim/:dim_id"});
        });
        this.route('status', function () {
        });
        this.resource('sources', function () {
          this.resource('source', {path: "/source/:source_id"});
        });
      });
      this.resource('dev', function () {
        this.route('cron');
        this.route('fresh');
      });
      this.resource('etl', function () {
      });
      this.resource('datasets', function () {
      });
    });
  });
});

export default Router;
