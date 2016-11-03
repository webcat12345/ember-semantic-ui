import Ember from 'ember';
export default Ember.Controller.extend({
  chartCt: Ember.computed.readOnly('model.dashboard.charts.length'),

  selectedDate: null,
  selectedCountMetric: null,

  observeDate: function() {
    var d = this.get('model.dashboard.date');
    var sd = this.get('selectedDate');

    if (!sd && d) {
      var dims = this.get('model.dimensions');
      var _this = this;
      dims.forEach(function(dim) {
        if (dim.get('factor').id === d) {
          _this.set('selectedDate', dim);
        }
      });
    }
    if (sd) {
      this.set('model.dashboard.date', sd.get('factor').id);
    }
  }.observes('selectedDate', 'model.dashboard.date').on('init'),

  observeCountMetric: function() {
    var d = this.get('model.dashboard.countmetric');
    var sd = this.get('selectedCountMetric');

    if (!sd && d) {
      var dims = this.get('model.metrics');
      var _this = this;
      dims.forEach(function(dim) {
        if (dim.get('factor').id === d) {
          _this.set('selectedCountMetric', dim);
        }
      });
    }
    if (sd) {
      this.set('model.dashboard.countmetric', sd.get('factor').id);
    }
  }.observes('selectedCountMetric', 'model.dashboard.countmetric').on('init'),
  saveText: "Save Dashboard",
  actions: {
    saveDashboard: function() {
      var _this = this;
      _this.set('saveText', 'Saving...');
      var d = this.get('model.dashboard');
      d.save().then(function() {
        _this.set('saveText', 'Saved');
      }, function(error) {
        console.log(error);
        _this.set('saveText', '(Error) Save Again');
      });
    }
  }
});

