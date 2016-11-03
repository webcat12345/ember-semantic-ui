import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  type: DS.attr(),
  dataType: DS.attr(),
  datasetId: DS.attr(),
  name: DS.attr(),
  group: DS.attr(),
  namespace: DS.attr(),
  description: DS.attr(),
  dimensionType : DS.attr(),
  actionable: DS.attr(),
  calculation: DS.attr(),
  status: DS.attr(),
  data_type: Ember.computed.alias('dataType'),
  dataset_id: Ember.computed.alias('datasetId'),
  dimension_type: Ember.computed.alias('metricType')

});
