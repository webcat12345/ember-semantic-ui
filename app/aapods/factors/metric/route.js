import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var m = this.modelFor('factors');
    var ret = {
      dataset_id : m.dataset_id,
      metrics: m.metrics,
      dimensions: m.dimensions,
      tables: m.tables,
      dataset: m.dataset,
      window: m.window,
      dashboard: m.dashboard
    };
    if (params.metric_id === 'new') {
      ret.metric = this.get('store').createRecord('Metric', {
        type: 'Metric',
        datasetId: m.dataset_id,
        namespace: 'Local',
        calculation: {'type':'Column'}
      });
    } else {
      ret.metric = this.store.findRecord('metric', params.metric_id);
    }
    return Ember.RSVP.hash(ret);
  }
});
