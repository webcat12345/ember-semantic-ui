import Ember from 'ember';
import ENV from 'datasenseui/config/environment';
import add_meta_data from "../../../../utils/news-feed";

var ChartProxy = Ember.ObjectProxy.extend({
  loading: true,
  subTitle: function() {
    let name = this.get('chart_name');
    let idx = name.indexOf('filtered by');
    if (idx < 0) {
      return null;
    } else {
      return "for " + name.substring(idx + 12);
    }
  }.property('chart_name'),
  change: null,
  fetchChange: function () {
    if (this.get('change')) {
      return;
    }
    let changeType = this.get('changeType');
    let enddate =  this.get('end_date');
    let startdate = this.get('start_date');
    let prevdate = moment(enddate).subtract(changeType.duration, changeType.durationType).format('YYYY-MM-DD');
    this.set('loading' ,true);
    let _this = this;
    Ember.$.get(ENV.api_endpoint + '/pattern/change/', {
      dataset_id: this.get('dataset_id'),
      metric_id: this.get('metric.id'),
      factor_id: this.get('dimension.id'),
      filter: this.get('filter'),
      start_date: startdate,
      end_date: enddate,
      a: prevdate,
      b: enddate
    }).then(function(data) {
      _this.set('loading' ,false);
      _this.set('change', data);
    }, function(error) {
      _this.set('loading' ,false);
      console.log(error);
    });
  },
  runFetchChange: function() {
    Ember.run.once(this, 'fetchChange');
  }
});
export default Ember.Controller.extend({
  init: function () {
    Ember.run.schedule("afterRender", this, ()=> {
      if (this.get('model.feed.charts')[0]) {
        this.set('chart', this.get('model.feed.charts')[0]);
      }
    });
  },
  editing: false,
  chart: null,
  topChart: null,
  selectedChart: null,
  selectedChangeType: {
    id: 'WoW',
    name: 'WoW',
    duration: 7,
    durationType: 'days'
  },
  chartCards: function() {
    let chs = this.get('model.feed.charts');
    let cards = Ember.A([]);
    let window = this.get('model.window');
    let changeType = this.get('selectedChangeType');
    chs.forEach(function(ch) {
      let c = ChartProxy.create({
        content : ch,
        changeType: changeType
      });
      cards.pushObject(c);
    });
    return cards;
  }.property('model.feed.charts.@each'),
  zoomToChart: function () {
    Ember.$('#charts').children().each((idx, chart)=> {
      if (this.get('selectedChart') && chart.id !== this.get('selectedChart')) {
        Ember.$(chart).hide("slow");
      } else {
        Ember.$(chart).show();
      }

    });
  }.observes('selectedChart'),
  resetDropdown: function () {
    this.set('selectedChart', null);
  }.observes('model.feed.charts.@each'),

  feed: function () {
    return add_meta_data(this.get('model.channels'), this.get('model.dashboard.date'), this.get('model.user'));
  }.property('model.channels'),
  actions: {
    modal: function (modal, data) {
      this.send('showModal', modal, data);
    },
    pinChart: function (chart_id) {
      this.send("showModal", "remove_chart", {
        chart_id: chart_id,
        feed: this.get('model.feed'),
        feed_id: this.get("model.newsfeed_id")
      });
    },
    showChart: function (chart) {
      this.set('topChart', chart);
    }
  }
});
