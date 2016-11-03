import DS from 'ember-data';

export default DS.Model.extend({
  datasetId : DS.attr(),
  name : DS.attr(),
  type : DS.attr(),
  path: DS.attr()
});
