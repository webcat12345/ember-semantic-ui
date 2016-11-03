import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  compare: Ember.inject.service('compare'),
  queryParams: {
    a: {
      refreshModel: true
    },
    b: {
      refreshModel: true
    },
    fltr: {
      refreshModel: true
    },
    metric_id: {
      refreshModel: true
    },
    factor_id: {
      refreshModel: true
    },
    sd: {
      refreshModel: true
    },
    ed: {
      refreshModel: true
    },
    validate: {
      refreshModel: true
    },
    search_str: {
      refreshModel: true
    },
    sort: {
      refreshModel: true
    },
    dim: {
      refreshModel: true
    }
  },
  model: function (params) {
    let ds = this.modelFor('datasetroot');
    let makeraw = params.make_raw_slices;
    if (params.dim && params.a === 'rest') {
      makeraw = true;
    }

    if (ds && ds.dataset && params.metric_id && params.factor_id) {
      let m = {
        dataset: ds.dataset,
        dataset_id: ds.dataset_id,
        window: ds.window,
        params: params,
        metrics: ds.metrics,
        dimensions: this.store.query('dimension', {dataset_id: ds.dataset_id, cooccur: params.metric_id}),
        dashboard: ds.dashboard,
        metric: this.store.findRecord('metric', params.metric_id),
        factor: this.store.findRecord('dimension', params.factor_id),
        compare: this.store.findRecord('compare', ds.dataset_id),
        user: this.controllerFor('application').get('user')
      };
      if (!params.statsig_only || params.statsig_only === 'false' || params.statsig_only === 'undefined' || params.statsig_only === 'null') {
        params.statsig_only = null;
      }
      m.results = this.get('compare').get_compare({
        dataset_id: ds.dataset_id,
        metric_id: params.metric_id,
        factor_id: params.factor_id,
        filter: params.fltr,
        dimension_id: params.dim,
        start_date: params.sd,
        end_date: params.ed,
        a: params.a,
        b: params.b,
        sortby: params.sort,
        params: params,
        adhoc_task: params.adhoc_task,
        deeper_adhoc: params.deeper_adhoc,
        ui_url: window.location.protocol + "//" + window.location.host,
        validate: params.validate,
        topN: params.topN,
        make_raw_slices: null,
        stat_sig_level: params.stat_sig_level,
        hist_level: params.hist_level,
        statsig_only: params.statsig_only,
        direction: params.sort_dir,
        num_id: params.num_id,
        den_id: params.denom_id,
        search_str: params.search_str
      }).then(function (model) {
        return model;
      }, function (error) {
        console.log("this is because of size of the compare call response too big");
        console.log(error);
        console.log(this);
      });
      return Ember.RSVP.hash(m);
    } else {
      return null;
    }
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.reset();
      controller.set('selectedStartMetric', null);
      controller.set('selectedEndMetric', null);
      controller.set('selectedFunnelType', null);
      controller.set('sort', 'combo');
      controller.set('result_tab', null);
    }
  },
  afterModel: function(model) {
    if (!model) {
      this.transitionTo('datasetroot', 'default');
    }
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    controller.initialize(model.params);
    controller.set('uniq_factors', model.compare.get('dimensions'));
    if (!model.params.result_tab) {
      if (model.dataset_id === 'caviar_eb' || model.dataset_id === 'groupon_ab' ||
        model.dataset_id === "groupon_ab_international" || model.dataset_id === 'whoeasy') {
        controller.set('result_tab', 'optimize');
      } else if (model.dataset_id === 'nvidia') {
        controller.set('result_tab', 'groups');
      } else {
        controller.set('result_tab', 'regular');
      }
    }
    if (model.params.search_str) {
      controller.set("searchStr", model.params.search_str);
    }
    if (!model.params.sort) {
      if (model.params.a === 'funnel') {
        controller.set('sortchoice', 'om');
      } else if (model.dataset_id === 'caviar_eb' || model.dataset_id === 'nvidia' || model.dataset_id === 'whoeasy') {
        controller.set('sortchoice', 'contribdiff');
      } else if (model.dataset_id === 'groupon_ab' || model.dataset_id === "groupon_ab_international") {
        controller.set('sortchoice', 'combo_ab');
      }
    }
    controller.set("statSig", 90);
    let query = this.queryRecords(model);
    //{compare_url: url, dataset_id: model.dataset_id, method:'why'};
    let _this = this;
    this.store.queryRecord('story', query).then(function (record) {
      if (!record) {
        let story = _this.createStoryRecord(model, "history");
        story.save();
      }
    });
    controller.set('type', 'change');

  },
  createStoryRecord: function (compareParams, stype) {
    let title = "random";
    var url = window.location.pathname;
    return this.store.createRecord('story', {
      datasetId: compareParams.dataset_id,
      compareUrl: url,
      title: title,
      timestamp: Date.now(),
      metricId: compareParams.params.metric_id,
      factorId: compareParams.params.factor_id,
      fltr: compareParams.params.fltr,
      sd: compareParams.params.sd,
      ed: compareParams.params.ed,
      a: compareParams.params.a,
      b: compareParams.params.b,
      uniq: this.uniq(compareParams)
    });
  },
  uniq: function (compareParams) {
    var record = {
      metric_id: compareParams.params.metric_id,
      factor_id: compareParams.params.factor_id,
      fltr: compareParams.params.fltr,
      sd: compareParams.params.sd,
      ed: compareParams.params.ed,
      a: compareParams.params.a,
      b: compareParams.params.b
    };
    return JSON.stringify(record);
  },
  queryRecords: function (compareParams) {
    return {uniq: this.uniq(compareParams), dataset_id: compareParams.dataset_id, method: "why"};
  },
  actions: {
    reload: function () {
      this.refresh();
    }
  }
});
