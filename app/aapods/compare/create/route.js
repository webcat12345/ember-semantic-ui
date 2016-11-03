import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    var dataset_id = this.modelFor('datasetroot').dataset_id;
    var chart = this.modelFor('chart');
    return Ember.RSVP.hash({
      dataset_id: dataset_id,
      chart: chart
    });
  }
});
