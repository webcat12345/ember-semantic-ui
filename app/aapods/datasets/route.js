import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    return Ember.RSVP.hash({
      datasets: ds.datasets      
    });
  }
});
