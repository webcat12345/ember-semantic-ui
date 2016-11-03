import Ember from 'ember';
import ENV from 'datasenseui/config/environment';


export default Ember.Route.extend({
  model: function() {
    return  Ember.RSVP.hash({
      fresh: Ember.$.get(ENV.api_endpoint + '/feed/freshness')
    });
  }
});
