import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function (params) {
    const ds = this.modelFor('datasetroot');
    const user = this.modelFor('loggedin');
    return Ember.RSVP.hash({
      datasets: ds.datasets,
      user: user,
      users: Ember.$.get(ENV.api_endpoint + "/users/")
    });
  },
  setupController: function (controller, model) {
    controller.set("model", model);
    controller.set("saveText", "Save");
    controller.set('user', this.modelFor('loggedin'));
  },
  actions: {
    refresh: function() {
      this.refresh();
    }
  }

});
