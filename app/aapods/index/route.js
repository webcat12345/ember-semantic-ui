import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    var m = this.modelFor('application');
    if (m.datasets && m.datasets.length === 1) {
      this.transitionTo('datasetroot', m.datasets[0].id);
    } else {
      this.transitionTo('datasetroot', 'default');
    }
  }
});
