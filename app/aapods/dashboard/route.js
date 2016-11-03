import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var ds = this.modelFor('datasetroot');

    return Ember.RSVP.hash({
      dataseat: ds.dataset,
      dashboard: this.store.findRecord('dashboard', ds.dataset_id)
    });
  }
});
