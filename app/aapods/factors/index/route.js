import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function() {
    var ds = this.modelFor('datasetroot');
    var m = this.modelFor('factors');
    return Ember.RSVP.hash({
      dataset : ds.dataset,
      metrics: m.metrics,
      dimensions: m.dimensions,
      params: m.params
    });
  }
});
