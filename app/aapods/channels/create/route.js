import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    var nfs = this.modelFor('channels');
    var m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      window: this.store.findRecord('window', ds.dataset_id),
      metrics: nfs.metrics,
      dimensions: nfs.dimensions
    };
    return Ember.RSVP.hash(m);
  }
});
