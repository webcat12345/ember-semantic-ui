import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var d = this.modelFor('datasetroot');
    return this.store.query('source', {dataset_id: d.dataset_id});
  }
});
