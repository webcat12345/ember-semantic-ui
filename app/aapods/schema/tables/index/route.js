import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function () {
    var m = this.modelFor('schema.tables');
    if (m.tables && m.tables.length > 0) {
      this.transitionTo('schema.tables.table', m.tables[0].id);
    }
  }
});
