import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    trash: function (story) {
      var _this = this;
      story.destroyRecord().then(function () {
        _this.send('reloadModel');
      });

    }
  }
});
