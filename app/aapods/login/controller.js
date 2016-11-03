import Ember from 'ember';
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend(LoginControllerMixin, {
    identification: null,
    password: null,
    authenticator: 'oauth-custom:oauth2-password-grant',

    actions: {
        // display an error when logging in fails
        sessionAuthenticationFailed: function(message) {
          this.set('errorMessage', message);
          console.log(message);
        },
        authorizationFailed: function(message) {
          this.set('errorMessage', message);
          console.log(message);
        },

        // handle login success
        sessionAuthenticationSucceeded: function() {
            this.set('errorMessage', "");
            this.set('identification', "");
            this.set('password', "");
            this._super();
        }
    }
});


