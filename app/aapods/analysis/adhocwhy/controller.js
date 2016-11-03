import Ember from 'ember';
import ENV from 'datasenseui/config/environment';
export default Ember.Controller.extend({

  needs: "application",
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),

  actions: {
    sendemail: function (dataset_id, fltr, metric_id, factor_id, a, b) {

      Ember.$.get(ENV.api_endpoint + '/pattern/adhocwhyemail/', {
        dataset_id: dataset_id,
        metric_id: metric_id,
        factor_id: factor_id,
        filter: fltr,
        a: a,
        b: b
      }).then(function () {
          alert("Email sent!");
        }, function (error) {
          alert("Error in sending email. Please try again. ");
          console.log(error);
        }
      );
    }
  }
});

