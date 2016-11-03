import DS from 'ember-data';

export default DS.Model.extend({
  datasetId: DS.attr(),
  query: DS.attr(),
  dataset_id: Ember.computed.alias('datasetId')
});
