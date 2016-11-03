import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var d = this.modelFor('datasetroot');
    return Ember.RSVP.hash({
      dataset_id: d.dataset_id,
      dataset: d.dataset
    });
  }
});
