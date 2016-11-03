import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    var ds = this.modelFor('datasetroot');
    return Ember.RSVP.hash({
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      metrics: this.store.query('metric', {dataset_id: ds.dataset_id})
    });
  }
});
