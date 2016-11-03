import Ember from 'ember';
import ENV from '../../../../../datasenseui/config/environment';
import add_meta_data from "../../../../utils/news-feed";


export default Ember.Controller.extend({
  needs: ["channels", "channels/channel", "application"],
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
  editing: Ember.computed.alias('controllers.channels/channel.editing'),
  queryParams: ['query', 'filter', 'storyType', 'sortBy', 'ranking',
    'pageSize', 'pagetype', 'pagetitle',
    'metric', 'segment_name', 'likes',
    'startDate', 'endDate', 'period',
    'displayType'],

  query: null,
  filter: null,
  storyType: null,
  sortBy: null,
  ranking: null,
  pageSize: null,
  pagetype: null,
  pagetitle: null,
  metric: null,
  segment_name: null,
  likes: null,
  startDate: null,
  endDate: null,
  period: null,
  displayType: null,

  queryField: Ember.computed.oneWay('query'),
  page: 1,

  topranges: function () {
    var today = moment();
    var ranges = [
      {name: 'All', endDate: null, startDate: null},
      {
        name: 'Yesterday',
        endDate: moment(today).format('YYYY-MM-DD'),
        startDate: moment(today).subtract(1, 'days').format('YYYY-MM-DD')
      },
      {
        name: 'Last 7 Days',
        endDate: moment(today).format('YYYY-MM-DD'),
        startDate: moment(today).subtract(7, 'days').format('YYYY-MM-DD')
      },
      {
        name: 'Last 30 Days',
        endDate: moment(today).format('YYYY-MM-DD'),
        startDate: moment(today).subtract(30, 'days').format('YYYY-MM-DD')
      }];
    return ranges;
  }.property(),
  selectedRange: function () {
    let sd = this.get('startDate');
    let tr = this.get('topranges');

    let found = 'All';
    tr.forEach(function (range) {
      if (range.startDate === sd) {
        found = range.name;
      }
    });
    return found;
  }.property('topranges', 'startDate'),
  isDate: function () {
    return this.get('startDate') !== null;
  }.property('startDate'),
  searchedStoryType: function () {
    let ms = this.get('model.follows.allstypes');
    let q = this.get('query');
    let likes = this.get('likes');
    let ret = 'All';
    if (likes === 'true') {
      ret = 'Likes';
    }
    ms.forEach(function (m) {
      if (m.id === q) {
        ret = m.name;
      }
    });
    return ret;
  }.property('query', 'model.follows.allstypes', 'likes'),
  searchedMetric: function () {
    let ms = this.get('model.follows.allmetrics');
    let q = this.get('query');

    let ret = 'All';
    ms.forEach(function (m) {
      if (m.id === q) {
        ret = m.name;
      }
    });
    return ret;
  }.property('query', 'model.follows.allmetrics'),
  searchedDimension: function () {
    let ms = this.get('model.follows.alldimensions');
    let q = this.get('query');
    let ret = 'All segments';
    if (q && q.toLowerCase() === 'overall') {
      ret = "Overall";
    }
    ms.forEach(function (m) {
      if (m.id === q) {
        ret = m.name;
      }
    });
    return ret;
  }.property('query', 'model.follows.alldimensions'),
  topicpage: function () {
    return this.pagetype === 'topic';
  }.property('pagetype'),
  reloadonedit: function () {
    if (this.editing) {
      this.send('reload');
    }
  }.observes('editing'),
  feed: function () {
    return add_meta_data(this.get('model.channels'), this.get('model.dashboard.date'), this.get('model.user'), this.get('model.metrics'));
  }.property('model.channels'),
  updateDate: function () {
    const startDate = this.get('qstartDate'),
      endDate = this.get('qendDate');
    if (startDate && endDate) {
      this.transitionToRoute('channels.channel.feed', {queryParams: {startDate: startDate, endDate: endDate}});
    }
  }.observes('qstartDate', 'qendDate'),
  actions: {
    reloadme: function () {
      this.send('reload');
    },
    search: function (query) {
      this.transitionToRoute('channels.channel.insights', {queryParams: {query: query}});
    },
    datePicked: function (startDate, endDate, route) {
      if (startDate && endDate) {
        this.transitionToRoute('channels.channel.insights', {queryParams: {startDate: startDate, endDate: endDate}});
      }
    },
    follows: function (entity, state, val) {
      let action = null;
      if (state) {
        action = "follow";
      } else {
        action = "unfollow";
      }
      var feed_id = this.get("model.feed_id");
      Ember.$.get(ENV.api_endpoint + "/feed/feed/follows", {
        feed_id: feed_id,
        entity: entity,
        action: action,
        val: val
      }).then((resp)=> {
        console.log(resp);
        //this.send('reload');
      });
    }
  }
});
