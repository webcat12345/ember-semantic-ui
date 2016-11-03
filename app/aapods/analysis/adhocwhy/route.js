import Ember from 'ember';
import ENV from 'datasenseui/config/environment';


export default Ember.Route.extend({
  model: function () {
    return Ember.RSVP.hash({
      adhocwhy: Ember.$.get(ENV.api_endpoint + '/pattern/adhocwhy?dataset_id=' + this.modelFor('datasetroot').dataset_id)
    });
  }
});
