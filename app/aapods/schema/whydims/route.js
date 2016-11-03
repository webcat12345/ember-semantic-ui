import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    return Ember.RSVP.hash({
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      dimensions: ds.dimensions,
      compare : this.store.findRecord('compare', ds.dataset_id)
    });
  }
});
