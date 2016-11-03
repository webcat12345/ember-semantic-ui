import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Service.extend({
  compare: Ember.inject.service('compare'),
  results: function (story) {
    return this.get('compare').get_compare({
      dataset_id: story.dataset_id,
      metric_id: story.metric_id,
      factor_id: story.factor_id,
      filter: story.fltr,
      dimension_id: story.dim,
      start_date: story.sd,
      end_date: story.ed,
      sortby: story.sort.key,
      a: story.a,
      b: story.b
    });
  }
});
