import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  needs: "application",
  size: "220px",
  feed_id: null,
  actions: {
    done: function () {

      Ember.$.get(ENV.api_endpoint + "/feed/" + this.get("model.feed_id") + '/remove_chart/' + this.get("model.chart_id"))
        .then(()=> {
          const feed = this.get('model.feed');
          const chart_id = this.get('model.chart_id');
          const index = feed.charts.findIndex(x=>x.id === chart_id);
          feed.charts.removeAt(index);
        })

    }
  }
});
