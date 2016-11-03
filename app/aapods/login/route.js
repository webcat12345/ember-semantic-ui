import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    // display an error when logging in fails
    sessionAuthenticationFailed: function() {
      this.controllerFor('login').set('errorMessage', "Login Failed: Invalid Password");
    },
    authorizationFailed: function() {
      this.controllerFor('login').set('errorMessage', "Unable to access resource. Not Authorized");
    }
  }
});
