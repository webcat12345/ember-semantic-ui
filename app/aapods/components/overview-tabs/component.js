import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    toggleedit: function () {
      this.set("editing", !this.get("editing"));
    }
  }

});
