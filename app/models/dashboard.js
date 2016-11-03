import DS from 'ember-data';

export default DS.Model.extend({
  datasetId: DS.attr(),
  name: DS.attr(),
  charts: DS.attr(),
  metrics: DS.attr(),
  dimensions: DS.attr(),
  date: DS.attr(),
  countmetric: DS.attr(),
  hasTargetMetric: DS.attr(),
  isWeek: DS.attr(),
  week: DS.attr(),
  user_table: DS.attr(),
  session_table: DS.attr(),
  event_table: DS.attr()
});
