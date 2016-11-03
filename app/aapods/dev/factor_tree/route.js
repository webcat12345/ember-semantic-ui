import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
//    var ds = this.modelFor('datasetroot');
    return  Ember.RSVP.hash({
      factor_tree: this.store.query('factor_tree', {})
    });
  }
});
