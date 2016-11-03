import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  dashboard: Ember.inject.service(),
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.reset();
      controller.set('type_date_dimensions_selected', null);
    }
  },
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    const dims_arr = ds.dimensions;
    const len = dims_arr.get('length');
    let dims = [];
    for (let i = 0; i < len; i++) {
      if( dims_arr.objectAt(i).get('calculation.type') !== 'Advanced'){
        dims.pushObject(dims_arr.objectAt(i));
      }else{
        console.log('skipping advanced metric');
      }
    }
    var m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      dashboard: ds.dashboard,
      window: ds.window,
      metrics: ds.metrics,
      segments: ds.segments,
      funnels: this.store.query('funnel', {dataset_id: ds.dataset_id}),
      params: params,
      dimensions: dims
    };
    return Ember.RSVP.hash(m);
  },

  setupController: function (controller, model) {
    this._super(controller, model);
    controller.initialize(model.params);
    if (model.params.timecomp) {
      controller.set('type_date_dimensions_selected', controller.get('type_date_dimensions').findBy('id', model.params.timecomp));
    } else {
      controller.set('type_date_dimensions_selected', null);
    }
    if (model.params.sm) {
      controller.set('qsm', controller.get('allmetrics').findBy('id', model.params.sm));
    }
    if (!model.params.type) {
      if (!model.params.sd || model.params.sd === model.dashboard.date) {
        controller.set('type', "line");
        controller.set('qtype', "line");
      } else {
        controller.set('type', "column");
        controller.set('qtype', "column");
      }
    }
    controller.setSelectedChartType(model.params.type, model.params.stacking);
  }
});
