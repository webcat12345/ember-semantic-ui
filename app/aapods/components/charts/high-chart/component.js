import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['highcharts', 'funnel'],
  tagName: 'div',

  getConfig: function () {
    const configs = {
      exporting: {enabled: false},
      chart: {
        type: this.get('type'),
        zoomType: 'xy'
      },
      title: {
        text: this.get('title')
      },
      series: this.get('data'),
      credits: {
        enabled: false
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          connectNulls: true,
          point: {
            events: {
              click: function () {
                this.sendAction('action', this);
              },
              select: function () {
                this.sendAction('select', this);
              },
              unselect: function () {
                this.sendAction('unselect', this);
              }
            }
          }
        }
      }
    };
    if (this.get('config')) {
      Ember.merge(configs, this.get('config'));
    }
    return configs;
  },
  redrawChart: function () {
    this.addCustomLabels();
    const config = this.getConfig();
    if (this.$()) {
      if (config.isDate) {
        this.$().highcharts('StockChart', config);
      } else {
        this.$().highcharts(config);
      }
    }

  }.observes('data', 'type', 'config'),

  addCustomLabels: function () {
    Highcharts.dateFormats = {
      W: function (timestamp) {
        return moment(timestamp).add(1, 'week').isoWeek();
      }
    };
  },

  didInsertElement: function () {
    this.addCustomLabels();
    const config = this.getConfig();
    if (config.isDate) {
      this.$().highcharts('StockChart', config);
    } else {
      this.$().highcharts(config);
    }
  }
})
;

