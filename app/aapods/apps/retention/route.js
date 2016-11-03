import Ember from 'ember';

export default Ember.Route.extend({
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.reset();
      controller.set('retention_start_value', null);
      controller.set('retention_end_value', null);
      controller.set('retention_dimension_values', null);
    }
  },

  model: function (params) {
    var ds = this.modelFor('datasetroot');
    //todo : appConfiguration should be dynamic
    var m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      window: ds.window,
      metrics: ds.metrics,
      dashboard: ds.dashboard,
      dimensions: ds.dimensions,
      params: params
    };
    return Ember.RSVP.hash(m);
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    controller.initialize(model.params);

    if (model.params.sort) {
      controller.set('sort', model.params.sort);
      controller.set('sort_dir', model.params.sort_dir);
    } else {
      controller.set('sort', 'b.pct');
      controller.set('sort_dir', 'desc');
    }

    if (model.params.factor_id) {
      controller.set('selected_time_window', controller.get('time_window_values').findBy('id', model.params.factor_id));
    } else {
      controller.set('selected_time_window', controller.get('time_window_values').findBy('name', 'Week'));
    }

    controller.set('dateChoice', controller.get('dateChoices').findBy('name', 'All'));
    if (model.params.denom_id) {
      controller.set('retention_start_value', model.params.denom_id);
    } else {
      controller.set('retention_start_value', 0);
    }
    if (model.params.num_id) {
      controller.set('retention_end_value', model.params.num_id);
    }


    controller.set('mtype', 'retention');
  }
});
