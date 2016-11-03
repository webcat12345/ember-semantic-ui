import Ember from 'ember';

export default Ember.Component.extend({
  isAdmin: Ember.computed.bool('user.is_staff'),
  actions: {

  }
});
