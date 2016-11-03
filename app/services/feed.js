import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Service.extend({
  compare: Ember.inject.service('compare'),
  _news_feeds: {},
  metric_stories: {},
  news_feed: function (feed_id, dataset_id, club_metric = true, club_segment = true, blacklist = false, limit = 10, why = true, factor_id = null) {
    return new Promise((resolve)=> {
      const qp = {
        dataset_id: dataset_id,
        club_metric: club_metric,
        feed_id: feed_id,
        club_segment: club_segment,
        blacklist: blacklist,
        limit: limit
      };
      const qs_string = JSON.stringify(qp);
      if (this._news_feeds[qs_string] && this._news_feeds[qs_string] !== "LOADING") {
        resolve(this._news_feeds[JSON.stringify(qp)]);
        this.notifyPropertyChange('metric_stories');
      }
      else if (this._news_feeds[qs_string] !== "LOADING") {
        this._news_feeds[qs_string] = "LOADING";

        Ember.$.get(ENV.api_endpoint + "/feed/feeds", qp)
          .then((newsfeed)=> {
            this._news_feeds[JSON.stringify(qp)] = newsfeed;
            let done = newsfeed.length;
            newsfeed.forEach((story)=> {
              this.get('compare').get_compare({
                dataset_id: dataset_id,
                metric_id: story.id,
                factor_id: factor_id,
                a: story.prevdatecol,
                b: story.datecol
              }).then((why)=> {
                why.change = why.bpt.mct - why.apt.mct;
                story.why = why;
                if (!this.metric_stories[story.id]) {
                  this.metric_stories[story.id] = [];
                }
                this.metric_stories[story.id].push(story);
                if (--done === 0) {
                  this.notifyPropertyChange('metric_stories');
                }
              }, ()=> {
                if (!this.metric_stories[story.id]) {
                  this.metric_stories[story.id] = [];
                }
                this.metric_stories[story.id].push(story);
                if (--done === 0) {
                  this.notifyPropertyChange('metric_stories');
                }
              });
            });
          });
      }
    });
  }
});


