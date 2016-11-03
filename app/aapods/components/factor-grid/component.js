import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'div',
  actions: {
    toggleFactor: function (factor) {
      factor.toggle();
      this.sendAction('factorToggled', factor);
    },
    toggleRemove: function (factor) {
      factor.toggleRemove();
      this.sendAction('removeToggled', factor);
    }
  }
});

