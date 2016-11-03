import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function () {
    var nfs = this.modelFor('channels');
    var ds = this.modelFor('datasetroot');
    let targetRoute = 'channels.channel.overview';
    if (ds.dataset_id === "whoeasy") {
      targetRoute = 'channels.channel.insights';
    }
    var ffeed = null;
    if (nfs.feed) {
      nfs.feed.forEach(function (n) {
        if (!ffeed) {
          ffeed = n.get('id');
        }
      });
    }
    if (ffeed) {
      this.transitionTo(targetRoute, ffeed, {queryParams: {query: "overall"}});
    } else {
      var metrics = nfs.metrics;
      var selectedFactorIds = [];
      var selectedMetricIds = [];
      if (metrics) {
        metrics.forEach(function (item) {
          selectedMetricIds.push(item.get("id"));
        });
      }
      var dimensions = nfs.dimensions;
      if (dimensions) {
        dimensions.forEach(function (item) {
          selectedFactorIds.push(item.get("id"));
        });
      }
      var comp = this.store.createRecord('feed', {
        datasetId: ds.dataset_id,
        name: "#default",
        n: 20,
        deltatype: "All",
        dimensions: selectedFactorIds,
        metrics: selectedMetricIds
      });
      var self = this;
      var onSuccess = function (data) {
        self.transitionTo(targetRoute, data.id, {queryParams: {query: "overall"}});
      };
      var onFail = function (error) {
        console.log(error);
      };
      comp.save().then(onSuccess, onFail);
    }
  }
});
