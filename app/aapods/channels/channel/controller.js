import Ember from 'ember';

export default Ember.Controller.extend({
  editing: false,
  needs: "application",
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
  breadCrumb: function () {
    return this.get("model.config.name");
  }.property("model.config"),
  actions: {
    toggleedit: function () {
      this.set("editing", !this.get("editing"));
    },
    follows: function (entity, state, val) {
      var action = undefined;
      if (state) {
        action = "follow";
      }
      else {
        action = "unfollow";
      }
      var feed_id = this.get("model.feed_id");
      Ember.$.get(ENV.api_endpoint + "/feed/feed/follows", {
        feed_id: feed_id,
        entity: entity,
        action: action,
        val: val
      }).then((resp)=> {
        console.log(resp);
        this.send('reload');
      });
    }
  }
});
