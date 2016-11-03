import Ember from 'ember';

export default Ember.Controller.extend({
  chartController : Ember.inject.controller('chart'),
  startDate: Ember.computed.readOnly('chartController.startDate'),
  endDate: Ember.computed.readOnly('chartController.endDate'),
  sm: Ember.computed.readOnly('chartController.sm'),
  sd: Ember.computed.readOnly('chartController.sd'),

  selectedFactorIds: null,
  saveText: "Save",
  rollingDate: false,
  dateRangeStr: function() {
    var sd = this.get('startDate');
    var ed = this.get('endDate');

    if (!sd || !ed) {
      return "Invalid Date";
    }
    return sd + " - " + ed;
  }.property('startDate', 'endDate'),
  dimensions: null,
  loadingDimensions: false,
  fetchDimensions: function () {
    var sm = this.get('sm');
    var dataset_id = this.get('model.dataset_id');
    this.set('loadingDimensions', true);
    var _this = this;
    this.store.query('dimension', {dataset_id: dataset_id, cooccur: sm}).then(function (dims) {
      _this.set('dimensions', dims);
      _this.set('loadingDimensions', false);
    }, function (error) {
      console.log(error);
      _this.set('loadingDimensions', false);
    });
  },
  processFetchDimensions: function () {
    Ember.run.once(this, 'fetchDimensions');
  }.observes('sm').on('init'),

  actions: {
    create: function() {
      this.set('saveText', 'Saving...');
      var comp = this.store.createRecord('compare', {
        datasetId : this.get('model.dataset_id'),
        metric : this.get('sm'),
        factor : this.get('sd'),
        numDays: this.get('model.window.numDays'),
        dimensions: this.get('selectedFactorIds')
      });
      var self = this;
      var onSuccess = function(data) {
        self.set('saveText', 'Saved');
        var chartm = self.get("model.chart");
        chartm.set('compare', data);
        self.transitionToRoute('chart',chartm);
      };

      var onFail = function(error) {
        self.set('saveText', '(Error) Save Again');
        console.log(error);
      };

      comp.save().then(onSuccess, onFail);
    }
  }
});

