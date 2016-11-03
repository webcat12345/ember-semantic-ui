import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  serverChart: null,
  title: null,
  xAxisTitle: null,
  yAxisTitle: null,

  click: function (pt) {
  },
  chart: function () {
    const schart = this.get('serverChart');
    const yAxisTitle = this.get('yAxisTitle');
    const xAxisTitle = this.get('xAxisTitle');
    const chart = {
      chart: {
        type: 'scatter',
        zoomType: false
      },
      title: {
        text: this.get('title')
      },
      xAxis: {
        title: {
          enabled: true,
          text: xAxisTitle
        },
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        tickLength: 0,
        lineColor: 'transparent'
      },
      yAxis: {
        title: {
          text: yAxisTitle
        },
        min: 0,
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        minorTickLength: 0,
        tickLength: 0
      },
      tooltip: {
        crosshairs: [true, true],
        useHTML: true,
        formatter: function () {
          return '<b>' + xAxisTitle + ':</b> ' + this.point.x + '<br>' +
            '<b>' + yAxisTitle + ':</b> ' + this.point.formattedy;
        }
      },
      plotOptions: {
        scatter: {
          marker: {
            radius: 2,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          }
        }
      },
      series: schart
    };
    return chart;
  }.property('serverChart')
});
