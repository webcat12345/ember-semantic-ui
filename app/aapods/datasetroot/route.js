import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import csvJson from '../../utils/csv-json';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  renderTemplate: function () {
    this.render();
    this.render('datasetroot/lhn', {
      into: 'application',
      outlet: 'lhn'
    });
  },
  model: function (params) {
    var _this = this;
    return Ember.RSVP.hash({
      dataset_id: params.dataset_id,
      datasets: csvJson(null, 'datasets', 'ajax')
    }).then(function (model) {
      var dataset = null;
      if (model.dataset_id === 'default' && model.datasets && model.datasets.length > 0) {
        if (model.datasets.length === 1) {
          dataset = model.datasets[0];
          model.dataset_id = dataset.id;
        } else {
          dataset = null;
        }
      }
      for (var i = 0; i < model.datasets.length; i++) {
        if (model.dataset_id === model.datasets[i].id) {
          dataset = model.datasets[i];
          break;
        }
      }
      if (dataset) {
        return {
          dataset_id: model.dataset_id,
          datasets: model.datasets,
          dataset: dataset,
          window: _this.store.findRecord('window', model.dataset_id),
          metrics: _this.store.filter('metric', {dataset_id: model.dataset_id}, (metric) => {
            return metric.get('datasetId') === model.dataset_id;
          }),
          dimensions: _this.store.filter('dimension', {dataset_id: model.dataset_id}, (dim) => {
            return dim.get('datasetId') === model.dataset_id;
          }),
          dashboard: _this.store.findRecord('dashboard', model.dataset_id),
          segments: _this.store.query('segment', {dataset_id: model.dataset_id})
        };
      } else {
        return Ember.RSVP.hash({
          dataset_id: null,
          datasets: model.datasets,
          dataset: null
        });
      }

    });
  },
  setupController: function (controller, model) {
    controller.set('model', model);
    this.controllerFor('application').set('model.datasets', model.datasets);
    this.controllerFor('application').set('dataset_id', model.dataset_id);
    this.controllerFor('application').set('dataset', model.dataset);
    if (model && model.dataset) {
      document.title = "Cuberon - " + model.dataset.name;
    }
  }
});
