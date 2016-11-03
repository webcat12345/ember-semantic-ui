import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function() {
    var ds = this.modelFor('datasetroot');
    return  Ember.RSVP.hash({
      sources: this.store.query('source', {dataset_id: ds.dataset_id}),
      tasks: this.store.query('task', {dataset_id: ds.dataset_id}),
      metrics: this.store.query('metric', {dataset_id: ds.dataset_id}),
      dimensions: this.store.query('dimension', {dataset_id: ds.dataset_id}),
      tables: Ember.$.get(ENV.api_endpoint + "/schema/tables/" + ds.dataset_id)
    });
  }
});
