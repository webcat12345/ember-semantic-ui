import Ember from 'ember';

export default Ember.Controller.extend({
  selectedFactorIds: null,
  selectedMetricIds: null,
  saveText: "Create",
  metrics: null,
  name: null,
  allMetrics: true,
  allDimensions: true,
  direction: "All",
  loadingDimensions: false,
  directionChoices: ["All", "Positive", "Negative"],
  n: 20,
  actions: {
    create: function () {
      this.set('saveText', 'Saving...');
      var metrics = this.get("model.metrics");
      var selectedFactorIds = [];
      var selectedMetricIds = [];
      if (this.allMetrics) {
        selectedMetricIds = metrics.toArray().map((x)=> {
          let result = x.toJSON();
          result.id = x.id;
          return result;
        });
      }
      var dimensions = this.get("model.dimensions");
      if (this.allDimensions) {
        selectedFactorIds = dimensions.toArray().map((x)=> {
          let result = x.toJSON();
          result.id = x.id;
          return result;
        });
      }
      var comp = this.store.createRecord('feed', {
        datasetId: this.get('model.dataset_id'),
        name: this.get('name'),
        n: this.get('n'),
        deltatype: this.get('direction'),
        dimensions: selectedFactorIds,
        metrics: selectedMetricIds
      });
      var self = this;
      var onSuccess = function (data) {
        self.set('saveText', 'Created');
        self.transitionToRoute('channels.channel.insights', data.id);
      };

      var onFail = function (error) {
        self.set('saveText', '(Error) Save Again');
        console.log(error);
      };
      comp.save().then(onSuccess, onFail);
    },
    cancel: function () {
      this.transitionToRoute('channels');
    }
  }
});

