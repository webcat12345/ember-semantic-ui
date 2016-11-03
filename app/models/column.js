import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  dataType: DS.attr(),
  datasetId: DS.attr(),
  name: DS.attr(),
  table: DS.attr(),
  namespace: DS.attr(),
  factor: DS.attr(),

  saveText: "Save",
  isMetric: Ember.computed.equal('factor.type', 'Metric'),
  isDimension: Ember.computed.equal('factor.type', 'Dimension')
});
