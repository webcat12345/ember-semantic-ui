import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ["application", "channels/channel"],
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
  channel: Ember.computed.readOnly("controllers.channels/channel.model.config"),
  actions: {
  	search: function(){
  		this.transitionTo('channels.search', {queryParams: {dataset_id: this.get("model.dataset_id"), query: this.get("searchText")}});
  	},
    feed_change: function (component, id) {
      if (id === 'create') {
        this.transitionToRoute('channels.create');
        return;
      }
      this.transitionToRoute('channels.channel.overview', id);
    }
  }
});
