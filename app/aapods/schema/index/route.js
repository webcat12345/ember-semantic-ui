import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function () {
    var ds = this.modelFor('datasetroot');
    var m = this.modelFor('schema');
    return Ember.RSVP.hash({
      dataset: ds.dataset,
      status: Ember.$.get(ENV.api_endpoint + "/schema/status/" + ds.dataset_id),
      dashboard: this.store.findRecord('dashboard', ds.dataset_id),
      metrics: m.metrics,
      dimensions: m.dimensions,
      boolean: [false, true]
    });
  }
});
