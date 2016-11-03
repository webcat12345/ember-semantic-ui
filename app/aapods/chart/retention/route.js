import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  dashboard: Ember.inject.service(),
  resetController(controller, isExiting) {
    if (isExiting) {
     controller.reset();
     this.set('selected_time_window', null);
      this.set('cohortTable', null);
      this.set('loadingCohorts', null);
      this.set('showMore', false);

    }
  },
  model: function (params) {
    var ds = this.modelFor('datasetroot');
    const dims_arr = ds.dimensions;
    const len = dims_arr.get('length');
    let dims = [];
    for (let i = 0; i < len; i++) {
      if( dims_arr.objectAt(i).get('calculation.type') !== 'Advanced'){
        dims.pushObject(dims_arr.objectAt(i));
      }else{
        console.log('skipping advanced metric');
      }
    }
    var m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      dashboard: ds.dashboard,
      window: ds.window,
      metrics: ds.metrics,
      params: params,
      dimensions: dims
    };
    return Ember.RSVP.hash(m);
  },
  setupController: function (controller, model) {
    this._super(controller, model);

    controller.initialize(model.params);
    if (!model.params.sd) {
      controller.set('qsd', controller.get('xaxis').findBy('id', model.dashboard.get('session_table.weeks_since_start')));
      controller.set('sd', model.dashboard.get('session_table.weeks_since_start'));
    } else {
      controller.set('qsd', controller.get('xaxis').findBy('id', model.params.sd));
    }
    if(!model.params.startDate){
       controller.set('qstartDate', model.window.get('startDate'));
       controller.set('qendDate', model.window.get('endDate'));
    }
    if (!model.params.sm) {
      controller.set('sm', model.dashboard.get('user_table.countmetric'));
      controller.set('qsm', model.metrics.findBy('id', model.dashboard.get('user_table.countmetric')));
    }

    controller.set('type', 'line');
    controller.set('qtype', 'line');
  }

});
