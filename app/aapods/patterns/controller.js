import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  needs: "application",
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
  queryParams: ['sm'],
  sm: null,
  insightGrps: null,
  topN: 1000,
  startDate: "2015-09-30",
  endDate: "2015-10-30",
  loadingGrps: false,
  getUrl: function (saved) {
    var dataset_id = this.get('model.dataset_id');
    var sm = this.get('sm');
    var startDate = this.get('startDate');
    var endDate = this.get('endDate');
    var topN = this.get('count');
    var query = {
      topN: topN,
      start_date: startDate,
      end_date: endDate
    };
    query.dataset_id = dataset_id;
    query.metric_id = sm;
    query.entity_type = "ecobee_mediabuys";

    var url = ENV.api_endpoint + '/search/insights/' +
      query.dataset_id + '/' +
      query.entity_type + '/' +
      query.metric_id;

    var grpurl = ENV.api_endpoint + '/search/insightgrps/' +
      query.dataset_id + '/' +
      query.entity_type + '/' +
      query.metric_id;

    return {url: url, grpurl: grpurl, query: query};
  },
  getGroupInsights: function () {
    var dataset = this.get('model.dataset_id');
    var entityType = "ecobee_mediabuys";
    var metric = this.get('sm');
    var date = this.get('date');
    var startDate = this.get('startDate');
    var endDate = this.get('endDate');

    if (!dataset || !entityType || !metric || !startDate ||!endDate) {
      return;
    }

    var _this = this;
    var q = this.getUrl(false);
    if (!q) {
      return;
    }
    this.set('loadingGrps', true);
    Ember.$.get(q.grpurl, q.query).done(
      function (insightgrps) {
        if (insightgrps) {
          _this.set('insightGrps', insightgrps);
        } else {
          _this.set('insightGrps', Ember.A([]));
        }
        _this.set('loadingGrps', false);
      }).fail(function (error) {
        _this.set('loadingGrps', false);
        console.log(this.url);
        console.log(error);
      }
    );
  },
  processGetInsights: function () {
    Ember.run.once(this, 'getGroupInsights');
  }.observes('sm')
});
