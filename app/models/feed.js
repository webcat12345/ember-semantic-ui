import DS from 'ember-data';

export default DS.Model.extend({
  datasetId : DS.attr(),
  name: DS.attr(),
  metric: DS.attr(),
  user: DS.attr(),
  countmetric: DS.attr(),
  dimensions: DS.attr(),
  deltatype: DS.attr(),
  whyparams: DS.attr(),
  date: DS.attr(),
  n: DS.attr(),
  blacklist: DS.attr(),
  metrics: DS.attr(),
  allmetrics: DS.attr(),
  alldimensions: DS.attr(),
  delta:DS.attr(),
  sort: DS.attr()
});
