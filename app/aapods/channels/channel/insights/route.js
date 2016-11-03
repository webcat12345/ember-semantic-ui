import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  queryParams: {
    query: {
      refreshModel: true
    },
    filter: {
      refreshModel: true
    },
    sortBy: {
      refreshModel: true
    },
    ranking: {
      refreshModel: true
    },
    pageSize: {
      refreshModel: true
    },
    pagetype: {
      refreshModel: true
    },
    likes: {
      refreshModel: true
    },
    startDate: {
      refreshModel: true
    },
    endDate: {
      refreshModel: true
    },
    storyType: {
      refreshModel: true
    },
    period: {refreshModel: true},
    pagetitle: {},
    metric: {},
    segment_name: {}
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    if (model.params.sortBy === "" || model.params.sortBy === null || model.params.sortBy == "null") {
      controller.set('sortBy', 'new');
    }
    if (!model.params.pageSize || model.params.sortBy == "null") {
      controller.set('pageSize', 25);
    }
    if (model.dataset_id === 'whoeasy') {
      controller.set('displayType', 'drivers');
      if (!model.params.statsig_only) {
        controller.set('statsig_only', true);
        model.params.statsig_only = true;
      }
      if (!model.params.stat_sig_level) {
        model.params.stat_sig_level = 90;
        controller.set('stat_sig_level', 90);
      }
      if (!model.params.hist_level) {
        controller.set('hist_level', 2);
        model.params.hist_level = 2;
      }
    }
    controller.set('queryField', model.params.query);

  },
  resetController: function (controller, isExiting) {
    if (isExiting) {
      var queryParams = controller.get('queryParams');
      for (var i = 0; i < queryParams.length; i++) {
        controller.set(queryParams[i], null);
      }
      controller.set('queryField', null);
    }
  },
  model: function (params) {
    const m = {};
    let ds = this.modelFor('datasetroot');
    let ch = this.modelFor('channels.channel');
    const sortOptions = [{name: "Relevance", value: "_score"}, {name: "New", value: "new"},
      {name: "Percentage Change", value: "abs_perc_delta"},
      {name: "Unexpected", value: "unexpected"},
      {name: "Trends", value: "trend"},
      {name: "Top Contributors", value: "top_performers"},
      {name: "Unexpected Contribution", value: "contribution_z"}];
    m["feed_id"] = this.paramsFor('channels.channel').feed_id;

    const qp = {
      dataset_id: ds.dataset_id,
      query: params.query,
      filter: params.filter,
      feed_id: m["feed_id"],
      sort: params.sortBy || "new",
      ranking_func: params.ranking_function,
      size: params.pagesize,
      likes: params.likes,
      start_date: params.startDate,
      end_date: params.endDate,
      story_type: params.storyType,
      period: params.period
    };
    Object.keys(qp).forEach(function (p) {
      if (qp[p] === 'null' || qp[p] === 'NaN' || qp[p] === 'undefined') {
        qp[p] = null;
      }
    });
    m["channels"] = Ember.$.get(ENV.api_endpoint + "/feed/feeds", qp);
    m["config"] = ch.config;
    m["follows"] = ch.follows;
    m["dashboard"] = ds.dashboard;
    m["user"] = this.controllerFor('application').get('user');
    m["window"] = ds.window;
    m["dataset"] = ds.dataset;
    m["dataset_id"] = ds.dataset_id;
    m["loading"] = false;
    m["sortOptions"] = sortOptions;
    m['metrics'] = ds.metrics;
    m['params'] = params;

    return Ember.RSVP.hash(m);
  },
  actions: {}
});
