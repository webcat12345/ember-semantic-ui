import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function () {
    const qs = this.getQueryString();
    this.sendcallback(qs);
  },
  getQueryString: function () {
    let result = {}, queryString = location.search.slice(1),
      re = /([^&=]+)=([^&]*)/g, m;

    while (m = re.exec(queryString)) {
      result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
  },
  sendcallback: function (params) {
    Ember.$.get(ENV.api_endpoint.concat('/setup/ga/oauth2callback/'), params).then(
      (response) => {
        console.log(response);
        this.transitionTo('source', response.state, 'newga');
      }, (error) => {
        console.log(error);
        this.transitionTo('source', 'default', 'newga');
      }
    );
  }
});
