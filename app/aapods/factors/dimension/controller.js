import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    saveComplete: function(fid) {
      this.transitionToRoute('factors.dimension', fid);
    }
  }
});

