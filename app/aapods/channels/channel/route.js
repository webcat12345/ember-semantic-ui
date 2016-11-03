import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Route.extend({
  model: function (params) {
    var m = {};
    let nf = this.modelFor('channels');
    let ds = this.modelFor('datasetroot');
    m["follows"] = Ember.$.get(ENV.api_endpoint + "/feed/feed/" + params.feed_id + "/follows");
    m['dataset_id'] = ds.dataset_id;
    m["nf"] = nf;
    m["dashboard"] = ds.dashboard;
    m["feed_id"] = params.feed_id;
    m['dataset_id'] = ds.dataset_id;
    m["config"] = nf.feed.findBy('id', params.feed_id);
    return Ember.RSVP.hash(m);
  },

  actions: {
    reload: function () {
      this.refresh();
    }
  }
});
