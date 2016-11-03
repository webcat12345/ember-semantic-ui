import Ember from 'ember';

export default Ember.Component.extend({
  headers: function () {
    if (!this.get('series') || this.get('series').length === 0) {
      return [];
    }
    return this.get('series').get(0).data.map((x)=>x.name);
  }.property('series'),

  actions: {
    toggle_serie: function (serie) {
      this.sendAction('toggle_serie', serie);
    }
  }
});
