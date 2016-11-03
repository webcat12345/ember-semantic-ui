import DS from 'ember-data';

export default DS.Model.extend({
  datasetId: DS.attr(),
  name: DS.attr(),
  type: DS.attr(),
  accountId: DS.attr(),
  webpropertyId: DS.attr(),
  profileId: DS.attr(),
  profileName: DS.attr(),
  url: DS.attr(),
  userWithCredentials: DS.attr()
});
