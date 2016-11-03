import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  saveText: "Save All",

  selectedDate: null,
  selectedUserId: null,
  selectedCountMetric: null,


  observeUserId: function () {
    var d = this.get('model.dashboard.userid');
    var sd = this.get('selectedUserId');

    if (!sd && d) {
      var dims = this.get('model.dimensions');
      var _this = this;
      dims.forEach(function (dim) {
        if (dim.get('id') === d) {
          _this.set('selectedUserId', dim);
        }
      });
    }
    if (sd) {
      this.set('model.dashboard.userid', sd.get('id'));
    }
  }.observes('selectedUserId', 'model.dashboard.userid').on('init'),

  observeDate: function () {
    var d = this.get('model.dashboard.date');
    var sd = this.get('selectedDate');

    if (!sd && d) {
      var dims = this.get('model.dimensions');
      var _this = this;
      dims.forEach(function (dim) {
        if (dim.get('id') === d) {
          _this.set('selectedDate', dim);
        }
      });
    }
    if (sd) {
      this.set('model.dashboard.date', sd.get('id'));
    }
  }.observes('selectedDate', 'model.dashboard.date').on('init'),

  observeCountMetric: function () {
    var d = this.get('model.dashboard.countmetric');
    var sd = this.get('selectedCountMetric');

    if (!sd && d) {
      var dims = this.get('model.metrics');
      var _this = this;
      dims.forEach(function (dim) {
        if (dim.get('id') === d) {
          _this.set('selectedCountMetric', dim);
        }
      });
    }
    if (sd) {
      this.set('model.dashboard.countmetric', sd.get('id'));
    }
  }.observes('selectedCountMetric', 'model.dashboard.countmetric').on('init'),
  saveDashText: "Save",
  actions: {
    saveDashboard: function () {
      var _this = this;
      _this.set('saveDashText', 'Saving...');
      var d = this.get('model.dashboard');
      d.save().then(function () {
        _this.set('saveDashText', 'Saved');
      }, function (error) {
        console.log(error);
        _this.set('saveDashText', '(Error) Save Again');
      });
    },
    createMetric: function () {
      this.transitionToRoute('factors.metric', 'new');
    },
    createDimension: function () {
      this.transitionToRoute('factors.dimension', 'new');
    }
  }
});

