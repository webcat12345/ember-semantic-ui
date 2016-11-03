import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  compare: Ember.inject.service('compare'),
  actions: {
    done: function () {
      var model = this.get('model');
      var deeper = this.get('run_deeper');
      this.get('compare').get_compare({
        dataset_id: model.dataset_id,
        metric_id: model.metric_id,
        factor_id: model.factor_id,
        filter: model.fltr,
        dimension_id: model.factor_id,
        start_date: model.sd,
        end_date: model.ed,
        a: model.a,
        b: model.b,
        adhoc_task: 1,
        deeper_adhoc: deeper,
        ui_url: window.location.protocol + "//" + window.location.host
      }).then(function (data) {
          // alert("The job has been created. Please check your email")
        }, function (error) {
          console.log(error);
        }
      );
    }
  }
});
