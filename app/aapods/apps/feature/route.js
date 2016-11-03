import Ember from 'ember';

export default Ember.Route.extend({
  dashboard: Ember.inject.service(),
  targetRoute: 'apps.feature',
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.reset();
    }
  },
  model: function (params) {
    const ds = this.modelFor('datasetroot');
    const m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      dashboard: ds.dashboard,
      dimensions: ds.dimensions,
      funnels: this.store.query('funnel', {dataset_id: ds.dataset_id}),
      window: ds.window,
      metrics: ds.metrics,
      params: params
    };
    return Ember.RSVP.hash(m);
  },

  setupController: function (controller, model) {
    this._super(controller, model);
    controller.initialize(model.params);

    if (!model.params.a) {
      controller.set('a', 'rest');
      model.params.a = 'rest';
    }

    controller.set('query_a', controller.get('a'));
    controller.set('query_b', controller.get('b'));

    if (!model.params.result_tab || !model.params.dim) {
      controller.set('result_tab', 'summary');
    }
    if (!model.params.sort) {
      controller.set('sort', 'diff_perc_count');
      controller.set('sort_dir', null);
      model.params.sort = 'diff_perc_count';
      model.params.sort_dir = null;
    }
    if (model.params.metric_id) {
      controller.set('selectedMetric', model.metrics.findBy('id', model.params.metric_id));
    }
  }
});
