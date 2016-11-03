import Ember from 'ember';
import ENV from 'datasenseui/config/environment';


export default Ember.Route.extend({
  dashboard: Ember.inject.service(),
  model: function () {
    return new Promise((resolve, reject)=> {
      const m = {};
      let ds = this.modelFor('datasetroot');
      m["dataset"] = ds;
      m.dataset.id = ds.dataset_id;
      m.dataset._id = ds.dataset_id;
      m['newsfeed_id'] = this.paramsFor('channels.channel').feed_id;

      m["dashboard"] = ds.dashboard;
      m['metrics'] = ds.metrics;
      m['window'] = ds.window;
      let query = {dataset_id: ds.dataset_id, method: "bookmarks"};
      m['stories'] = this.store.query('story', query);
      //charts should be a data model with names as a computed property
      m["config"] = this.modelFor('channels.channel').config;
      Ember.$.get(ENV.api_endpoint + "/feeds/" + m['newsfeed_id']).then((data)=> {
        m['feed'] = data;
        resolve(Ember.RSVP.hash(m));
      });
    });

  },
  resetController: function (controller, isExiting) {
    if (isExiting) {
      // isExiting would be false if only the route's model was changing
      controller.set('topChart', null);
    }
  },
  actions: {
    reload: function () {
      this.refresh();
    }
  }
});




