import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Service.extend({
  _dashboards: {},
  get_dashboard: function (dataset_id) {
    return new Promise((resolve)=> {
      if (this.get('_dashboards').dataset_id) {
        return resolve(this.get('_dashboards').dataset_id);
      }
      else {
        Ember.$.get(ENV.api_endpoint + "/dashboards/" + dataset_id)
          .then((data)=> {
            this.get('_dashboards').dataset_id = data;
            return resolve(data);
          });
      }
    });
  }
});
