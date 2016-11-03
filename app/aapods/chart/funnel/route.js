import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  dashboard: Ember.inject.service(),
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.reset();
      controller.set('saveString', 'Save');
    }
  },
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    const dims_arr = this.modelFor('chart').dimensions;
    const len = dims_arr.get('length');
    let dims = [];
    for (let i = 0; i < len; i++) {
      if (dims_arr.objectAt(i).get('calculation.type') !== 'Advanced') {
        dims.pushObject(dims_arr.objectAt(i));
      } else {
        console.log('skipping advanced metric');
      }
    }
    var m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      dashboard: ds.dashboard,
      window: ds.window,
      metrics: ds.metrics,
      params: params,
      dimensions: dims,
      funnels: this.store.filter('funnel', {dataset_id: ds.dataset_id}, function (f) {
        return f.get('datasetId') === ds.dataset_id && f.get("isNew") === false;
      })
    };
    return Ember.RSVP.hash(m);
  },
  setupController: function (controller, model) {
    this._super(controller, model);

    controller.initialize(model.params);
    if (model.params.sd) {
      controller.set('qsd', model.funnels.findBy('id', model.params.sd));
    }
    if (!model.params.sm) {
      controller.set('sm', model.dashboard.get('session_table.countmetric'));
      controller.set('qsm', model.metrics.findBy('id', model.dashboard.get('session_table.countmetric')));
    }

    controller.set('saveString', 'Save');
    controller.set('type', 'column');
    controller.set('qtype', 'column');
  },
  actions: {
    reload: function () {
      this.refresh();
    }
  }
});
