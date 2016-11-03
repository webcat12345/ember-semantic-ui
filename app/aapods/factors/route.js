import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    return Ember.RSVP.hash({
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      metrics: ds.metrics,
      dimensions: ds.dimensions,
      window: ds.window,
      dashboard: ds.dashboard,
      params: params,
      tables: Ember.$.get(ENV.api_endpoint + "/schema/tables/" + ds.dataset_id)
    });
  }
});
