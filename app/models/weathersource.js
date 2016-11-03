import DS from 'ember-data';

export default DS.Model.extend({
  datasetId: DS.attr(),
  name: DS.attr('string'),
  table_name: DS.attr('string'),
  column_name: DS.attr('string')
});
