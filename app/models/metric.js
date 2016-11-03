import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  type: DS.attr(),
  dataType: DS.attr(),
  datasetId: DS.attr(),
  name: DS.attr(),
  group: DS.attr(),
  namespace: DS.attr(),
  description: DS.attr(),
  calculation: DS.attr(),
  betterDirection: DS.attr(),
  unitType: DS.attr(),
  status: DS.attr(),
  data_type: Ember.computed.alias('dataType'),
  dataset_id: Ember.computed.alias('datasetId'),
  better_direction: Ember.computed.alias('betterDirection'),
  unit_type: Ember.computed.alias('unitType'),

  unit_format: function () {
    const unitType = this.get('unit_type');
    if (unitType === '%') {
      return "percentage";
    } else {
      return "metric";
    }
  }.property('unit_type'),

  isPrerun: function () {
    let g = this.get('group');
    if (g && g.indexOf('prerun') > 0) {
      return true;
    } else {
      return false;
    }
  }.property('group')
});
