import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  loadingValues: false,
  values: null,
  title: function() {
    var n = this.get('model.name');
    if (n) {
      return "Samples Values for ".concat(n);
    } else {
      return "Sample Values";
    }
  }.property('model.name'),
  fetchValues: function () {
    var colid = this.get('model.id');
    this.set('loadingValues', true);
    var _this = this;
    if (!colid) {
      return;
    }
    Ember.$.get(ENV.api_endpoint + "/columns/" + colid + "/freqvalues").then(
      function (data) {
        _this.set('values', data);
        _this.set('loadingValues', false);
      }, function (error) {
        console.log(error);
        _this.set('loadingValues', false);
      });

  }.observes('model.id').on('init')
});

