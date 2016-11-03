import DS from 'ember-data';

export default DS.Model.extend({
  datasetId : DS.attr(),
  dimensions: DS.attr()
});
