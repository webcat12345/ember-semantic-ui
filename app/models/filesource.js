import DS from 'ember-data';

export default DS.Model.extend({
  datasetId : DS.attr(),
  name : DS.attr(),
  type : DS.attr(),
  path: DS.attr(),
  file_type: DS.attr(),
  delimiter: DS.attr(),
  is_dictionary: DS.attr(),
  dict_join_info: DS.attr()
});
