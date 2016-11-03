import Ember from 'ember'
import ENV from 'datasenseui/config/environment'


export default Ember.Component.extend({

  feed: Ember.inject.service(),
  stories: [],

  load_data: function () {
    const metric_id = this.get('metric_id');
    const factor_id = this.get('selectedDimensionId');
    const dataset_id = this.get('dataset_id');
    this.get('feed').news_feed(this.get("feed_id"), dataset_id, false, true, true, 30, true, factor_id);

  }.observes('metric_id').on('init'),

  watch_metric: function () {
    this.set('stories', this.get('feed').metric_stories[this.get('metric_id')])
  }.observes('feed.metric_stories.@each').on('init'),


  actions: {}


})
