import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    var m = {
      dimensions: ds.dimensions
    };
    return Ember.RSVP.hash(m);
  }
});
