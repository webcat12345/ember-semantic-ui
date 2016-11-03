import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  dashboard: Ember.inject.service(),
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.reset();
    }
  },
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    var m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      dashboard: ds.dashboard,
      window: ds.window,
      metrics: ds.metrics,
      segments: ds.segments,
      funnels: this.store.query('funnel', {dataset_id: ds.dataset_id}),
      params: params,
      dimensions: this.modelFor('chart').dimensions
    };
    return Ember.RSVP.hash(m);
  },

  setupController: function (controller, model) {
    this._super(controller, model);
    controller.initialize(model.params);
  }
});
