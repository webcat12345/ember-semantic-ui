import Ember from 'ember';

export default Ember.Route.extend({
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.reset();
      controller.set('selectedStartMetric', null);
      controller.set('selectedEndMetric', null);
      controller.set('selectedFunnelType', null);
    }
  },

  model: function (params) {
    var ds = this.modelFor('datasetroot');
    let configuration = {};
    if (ds.dataset_id === 'thredup_sessions') {
      configuration = {
        "selectedCountMetric_id": "575f3ad5cb19993f17ec6776",
        "queryDimension_id": "575f4df4e2108e005d44822f",
        "settings_ResultDim_id": "575f4df4e2108e005d44822f"
      };
    }
    const m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      window: ds.window,
      metrics: ds.metrics,
      dashboard: ds.dashboard,
      dimensions: ds.dimensions,
      params: params,
      configuration: configuration
    };
    return Ember.RSVP.hash(m);
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    controller.initialize(model.params);

    if (model.params.mtype) {
      controller.set('selectedFunnelType', model.params.mtype);
    } else {
      controller.set('selectedFunnelType', 'metric');
    }


    if (model.params.mtype === 'events') {
      if (model.params.num_id) {
        controller.set('selectedEndEvent', model.params.num_id);
      }
      if (model.params.denom_id) {
        controller.set('selectedStartEvent', model.params.denom_id);
      }
    } else if (model.params.mtype === 'twometrics') {
      if (model.params.num_id) {
        controller.set('selectedStartMetric', model.metrics.findBy('id', model.params.denom_id));
      }
      if (model.params.denom_id) {
        controller.set('selectedEndMetric', model.metrics.findBy('id', model.params.num_id));
      }
    }

    controller.set('a', 'funnel');

    if (model.configuration['selectedCountMetric_id']) {
      controller.set('selectedCountMetric', model.metrics.findBy('id', model.configuration['selectedCountMetric_id']));
    }

    if (!model.params.factor_id && model.configuration['queryDimension_id']) {
      controller.set('queryDimension', model.dimensions.findBy('id', model.configuration['queryDimension_id']));
    }

    if (!model.params.dim && model.configuration['settings_ResultDim_id']) {
      const settings_ResultDim = model.dimensions.findBy('id', model.configuration['settings_ResultDim_id']);
      controller.set('resultDimension', settings_ResultDim);
    }

    if (model.configuration['settings_ResultDim_id']) {
      controller.set('displaySettings.showDriverSelect', false);
    }

    if (model.params.make_raw_slices === 'false') {
      controller.set('make_raw_slices', null);
    } else {
      controller.set('make_raw_slices', "true");
    }

    if (model.params.sort) {
      controller.set('sort', model.params.sort);
      controller.set('sort_dir', model.params.sort_dir);
    } else {
      controller.set('sort', 'b.om');
      controller.set('sort_dir', 'desc');
    }
    if (model.dataset_id === 'platform9') {
      controller.set('dateChoice', controller.get('dateChoices').findBy('name', '12 weeks'));
    } else {
      controller.set('dateChoice', controller.get('dateChoices').findBy('name', '2 weeks'));
    }
    if (!model.params.result_tab) {
      controller.set('result_tab', 'dimension');
    }
  }
})
;
