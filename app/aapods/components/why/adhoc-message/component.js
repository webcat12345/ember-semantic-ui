import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Component.extend({
  tagName: '',
  isPie: false,

  compare: Ember.inject.service('compare'),
  actions: {
    cancel: function () {
      this.sendAction("cancel");
    },
    done: function () {
      let _this = this;
      var model = this.get('model');
      var deeper = this.get('run_deeper');
      this.get('compare').get_compare({
        dataset_id: this.get("dataset_id"),
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
          console.log("it worked!");
          _this.sendAction("done");
        }, function (error) {
          _this.sendAction("cancel");
          console.log(error);
        }
      );
    }

  }
});
