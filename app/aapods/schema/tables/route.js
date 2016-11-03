import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    return Ember.RSVP.hash({
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      tables: Ember.$.get(ENV.api_endpoint + "/schema/tables/" + ds.dataset_id),
      //columns: this.store.query('column', query),
      metrics: ds.metrics,
      dimensions: ds.dimensions
    });
  }
});
