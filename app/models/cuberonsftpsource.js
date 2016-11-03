import DS from 'ember-data';

export default DS.Model.extend({
  "datasetId": DS.attr(),
  "name": DS.attr(),
  "num_days": DS.attr(),
  "date_format": DS.attr(),
  "file_type": DS.attr(),
  "type": DS.attr(),
  "delimiter": DS.attr(),
  "compression": DS.attr(),
  "folder_name": DS.attr(),
  "file_prefix": DS.attr(),
  "file_suffix": DS.attr()
});
