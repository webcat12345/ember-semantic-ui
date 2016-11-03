import DS from 'ember-data';

export default DS.Model.extend({
  datasetId : DS.attr(),
  name : DS.attr(),
  type : DS.attr(),
  apiKey: DS.attr(),
  apiSecret: DS.attr(),
  numDays: DS.attr()
});
