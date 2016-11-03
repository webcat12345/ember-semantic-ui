import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var m = this.modelFor('factors');
    var ret = {
      dataset_id : m.dataset_id,
      dataset: m.dataset,
      metrics: m.metrics,
      dimensions: m.dimensions,
      tables: m.tables,
      window: m.window,
      dashboard: m.dashboard
    };
    if (params.dim_id === 'new') {
      ret.dimension = this.get('store').createRecord('Dimension', {
        type: 'Dimension',
        datasetId: m.dataset_id,
        namespace: 'Local',
        calculation: {'type':'Column'}
      });
    } else {
      ret.dimension = this.store.findRecord('dimension', params.dim_id);
    }
    return Ember.RSVP.hash(ret);
  }
});
