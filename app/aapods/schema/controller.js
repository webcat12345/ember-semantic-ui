import Ember from 'ember';


export default Ember.Controller.extend({
  needs: "application",
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin")
});
