import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function () {
    return Ember.$.get(ENV.api_endpoint + '/users/current/');
  },
  setupController: function (controller, model) {
    this.controllerFor('application').set('user', model);
    let mp = this.get('mixpanel');
    if (mp) {
      mp.identify(model.username);
    }
    if (window.__insp) {
      window.__insp.push(['identify', model.username]);
    }
  }
});
