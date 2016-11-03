import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['type'],
  type: null,
  metricSearch: null,
  dimSearch: null,
  showMoreMetrics: false,
  showMoreDims: false,
  metrics: function () {
    let ms = this.get('model.metrics');
    let search = this.get('metricSearch');
    let metrics = ms.filter(function (m, index, enumerable) {
      return !search || m.get('name').toLowerCase().indexOf(search.toLowerCase()) >= 0;
    }).sortBy('name');
    if (!this.get('showMoreMetrics')) {
      return metrics.slice(0, 5);
    }
    return metrics;
  }.property('model.metrics', 'metricSearch', 'showMoreMetrics'),

  dimensions: function () {
    let dims = this.get('model.dimensions');
    let search = this.get('dimSearch');
    let retdims = dims.filter(function (dim, index, enumerable) {
      return !search || dim.get('name').toLowerCase().indexOf(search.toLowerCase()) >= 0;
    }).sortBy('name');
    if (!this.get('showMoreDims')) {
      return retdims.slice(0, 5);
    }
    return retdims;
  }.property('model.dimensions', 'dimSearch', 'showMoreDims'),
  isDimension: function () {
    return !!(!this.get('type') || this.get('type') === 'dimension');
  }.property('type'),

  isMetric: function () {
    return !!(!this.get('type') || this.get('type') === 'metric');
  }.property('type'),
  actions: {
    toggleShowMetrics: function() {
      this.set('showMoreMetrics', !this.get('showMoreMetrics'));
    },
    toggleShowDims: function() {
      this.set('showMoreDims', !this.get('showMoreDims'));
    }
  }
});

