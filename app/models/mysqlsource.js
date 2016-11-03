import DS from 'ember-data';

export default DS.Model.extend({
  datasetId : DS.attr(),
  name : DS.attr(),
  type : DS.attr(),
  username: DS.attr(),
  password: DS.attr(),
  hostname: DS.attr(),
  port: DS.attr(),
  refresh: DS.attr(),
  db: DS.attr(),
  sql: DS.attr()
});
