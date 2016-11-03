import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    return Ember.RSVP.hash({
      dataset: ds.dataset,
      columns: this.store.query('column', {'dataset_id':ds.dataset_id, 'table':params.table_id})
    });
  }
});
