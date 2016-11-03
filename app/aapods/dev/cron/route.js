import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var ds = this.modelFor('datasetroot');
    return  Ember.RSVP.hash({
      tasks: this.store.query('task', {})
    });
  }
});
