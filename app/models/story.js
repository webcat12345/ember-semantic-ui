import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  datasetId : DS.attr(),
  userId: DS.attr(),
  compareUrl : DS.attr(),
  title: DS.attr(),
  stype: DS.attr(),
  timestamp: DS.attr(),
  metricId: DS.attr(),
  factorId: DS.attr(),
  fltr: DS.attr(),
  sd: DS.attr(),
  ed: DS.attr(),
  a: DS.attr(),
  b: DS.attr(),
  uniq: DS.attr()
});