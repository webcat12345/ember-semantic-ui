import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  needs: "application",
  size: "220px",
  feed_id: null,
  actions: {
    done: function () {
      Ember.$.post(ENV.api_endpoint + "/feed/" + this.get('feed_id') + '/save_chart', this.get('model.chart'))
        .then(()=> {
          this.get('controllers.application').setMessage("success", "Successfully saved the chart to your dashboard");
        }, ()=> {
          this.get('controllers.application').setMessage("error", "Could not save the chart to your dashboard");
        });

    }
  }
});
