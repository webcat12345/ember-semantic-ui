import DS from 'ember-data';

export default DS.Model.extend({
  datasetId : DS.attr(),
  name : DS.attr(),
  type : DS.attr(),
  awsAccessKeyId: DS.attr(),
  awsSecretAccessKey: DS.attr(),
  numDays: DS.attr(),
  prefix: DS.attr(),
  bucket: DS.attr(),
  dateFormat: DS.attr(),
  fileType: DS.attr(),
  delimiter:  DS.attr(),
  compression: DS.attr()
});
