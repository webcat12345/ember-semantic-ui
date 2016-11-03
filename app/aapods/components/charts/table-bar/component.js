import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['highcharts'],
  getConfig: function () {
    var color = this.get('color');
    var value = this.get('value');
    if (!color) {
      color = 'blue';
    }
    if (!value) {
      return;
    }
    value = Number(value);
    var configs = {

      title:{
        text:''
      }  ,
      chart: {
        type: 'bar',
        height: '50'
      },
      exporting: { enabled: false } ,
      legend: {enabled: false},
      xAxis: [{
        title: {
          enabled: false
        },
        categories: ['value'],
        reversed: false,

        gridLineWidth: 0,
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        labels: {
          enabled: false
        },
        minorTickLength: 0,
        tickLength: 0
      }],
      yAxis: {
        gridLineWidth: 0,
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        labels: {
          enabled: false
        },
        title: {
          enabled: false
        },
        minorTickLength: 0,
        tickLength: 0
      },

      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            color: color
          },
          enableMouseTracking: false
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        data: [{
          y: value,
          color: color
        }]
      }]
    };
    if (this.get('config')) {
      Ember.merge(configs, this.get('config'));
    }
    return configs;
  },
  redrawChart: function () {
    var config = this.getConfig();
    if (this.$()) {
      this.$().highcharts(config);
    }
  }.observes('config', 'color', 'value'),
  didInsertElement: function () {
    var config = this.getConfig();
    this.$().highcharts(config);
  }
});

