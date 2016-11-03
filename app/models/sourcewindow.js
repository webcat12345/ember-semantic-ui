import DS from 'ember-data';

export default DS.Model.extend({
  datasetId : DS.attr(),
  source: DS.attr(),
  startDate: DS.attr(),
  endDate: DS.attr()
});
