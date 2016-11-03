import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    var m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      metrics: ds.metrics
    };
    return Ember.RSVP.hash(m);
  }
});
