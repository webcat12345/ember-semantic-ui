import Ember from 'ember';
import ENV from 'datasenseui/config/environment'

export default Ember.Service.extend({
    metrics: function(story){
        return Ember.$.get(ENV.api_endpoint + '/pattern/change/', {
            dataset_id: story.dataset_id,
            metric_id: story.metric_id,
            factor_id: story.factor_id,
            filter: story.fltr,
            start_date: story.sd,
            end_date: story.ed,
            a: story.a,
            b: story.b
        });
    }
});
