import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  dashboard: Ember.inject.service(),
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.queryParams.forEach((param)=> {
        controller.set(param, null);
      });
    }
  },
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    var m = {
      dataset: ds.dataset,
      functions: [{id:'EqualTo', name: 'Equal to', value: '=='}, {id:'IsOneOf', name: 'Is one of', value: ',,'}, {
    id:'greaterthan', name: 'Greater than',
    value: ">="
  }, {id:'lowerthan', name: 'Lower than', value: "<="}],
      dataset_id: ds.dataset_id,
      dashboard: ds.dashboard,
      window: ds.window,
      metrics: ds.metrics,
      params: params,
      dimensions: this.modelFor('chart').dimensions
    };
    return Ember.RSVP.hash(m);
  }
});
