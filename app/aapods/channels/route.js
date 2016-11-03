import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    var ds = this.modelFor('datasetroot');
    var m = {
      dataset: ds.dataset,
      dataset_id: ds.dataset_id,
      user: this.modelFor('loggedin'),
      window: ds.window,
      metrics: ds.metrics,
      dimensions: ds.dimensions,
      feed: this.store.filter('feed', {dataset_id: ds.dataset_id}, (feed) => {
          return feed.get('datasetId') === ds.dataset_id;
        })
    };
    return Ember.RSVP.hash(m);
  }
});
