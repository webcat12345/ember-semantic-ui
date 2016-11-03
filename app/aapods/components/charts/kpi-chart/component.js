import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Component.extend({
  tagName: 'div',
  dataset: null,
  selectedMetricId: null,
  selectedDimensionId: null,
  startDate: null,
  endDate: null,
  type: null,
  topN: null,
  filter: null,

  serverChart: null,

  loading: false,

  processFetchChart: function () {
    Ember.run.once(this, 'fetchChart');
  }.observes('selectedMetricId', 'selectedDimensionId', 'startDate', 'endDate', 'sortm', 'sortd', 'topN').on('init'),

  click: function (pt) {
    var apt = this.get('Apt');
    var bpt = this.get('Bpt');
    var setPoint = this.get('setPoint');
    if (apt && apt.name === pt.name) {
      apt.select(false, true);
      setPoint('a', null);
      this.set('Apt', null);
      return;
    }
    if (bpt && bpt.name === pt.name) {
      bpt.select(false, true);
      setPoint('b', null);
      this.set('Bpt', null);
      return;
    }

    if (!apt) {
      pt.select(true, true);
      setPoint('a', pt.name);
      this.set('Apt', pt);
    } else if (!bpt) {
      pt.select(true, true);
      setPoint('b', pt.name);
      this.set('Bpt', pt);
    } else {
      if (apt) {
        apt.select(false, true);
      }
      pt.select(true, true);
      setPoint('a', pt.name);
      this.set('Apt', pt);
    }
  },
  Apt: null,
  Bpt: null,

  chartService: Ember.inject.service('chart'),
  fetchChart: function () {
    var selectedMetricId = this.get('selectedMetricId');
    var selectedDimensionId = this.get('selectedDimensionId');
    var startDate = this.get('startDate');
    var endDate = this.get('endDate');
    var sortm = this.get('sortm');
    var sortd = this.get('sortd');
    var ds = this.get('dataset');
    var filter = this.get('filter');
    var topN = this.get('topN');
    if (!selectedMetricId || !ds || !selectedDimensionId || !startDate || !endDate) {
      return;
    }
    this.set('loading', true);
    var _this = this;

    this.get('chartService').getChart({
        dataset_id: ds.id, metric_id: selectedMetricId, dimension_id: selectedDimensionId,
        start_date: startDate, end_date: endDate, sortm: sortm, sortd: sortd, topN: topN, filter: filter
      })
      .then(function (data) {
          if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
            // do your destroying code setting stuff
            _this.set('loading', false);
            _this.set('serverChart', data);
          }
        }, function (error) {
          _this.set('loading', false);
          console.log(error);
        }
      );
  },
  chart: function () {
    var schart = this.get('serverChart');
    var markeddata = schart.series;
    if (!schart || !schart.series) {
      return;
    }
    if (schart.series[schart.series.length - 1] && schart.series[schart.series.length - 1].y) {
      this.set("title", schart.series[schart.series.length - 1].y);
    }

    var otype = this.get('type');
    var type = null;
    if (otype) {
      type = otype;
    } else {
      type = schart.type;
    }
    var yAxis = schart.metric;
    var xAxis = schart.dimension;
    var unit = yAxis.unit_type;
    var name = schart.name;
    if (!unit) {
      unit = '';
    }
    var step = 1;
    if (schart.series && schart.series[0]) {
      step = Math.ceil(schart.series[0].length / 20);
    }
    var chart = {
      title: {useHTML: true, text: name},
      chart: {
        zoomType: "xy",
        backgroundColor: null,
        borderWidth: 0,
        type: 'area',
        margin: [2, 2, 2, 10],
        width: 120,
        height: 20,
        style: {
          overflow: 'visible'
        },
        skipClone: true
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'category',
        labels: {enabled: false},
        title: {
          text: null
        },
        startOnTick: false,
        endOnTick: false,
        tickPositions: []
      },
      yAxis: {
        endOnTick: false,
        startOnTick: false,
        labels: {
          enabled: false
        },
        title: {
          text: null
        },
        tickPositions: [0]
      },
      series: [{name: "default", data: markeddata}],
      legend: {
        enabled: false
      },
      tooltip: {
        backgroundColor: null,
        borderWidth: 0,
        shadow: false,
        useHTML: true,
        hideDelay: 0,
        shared: true,
        padding: 0,
        positioner: function (w, h, point) {
          return {x: point.plotX - w / 2, y: point.plotY - h};
        }
      },
      plotOptions: {
        series: {
          animation: false,
          lineWidth: 1,
          shadow: false,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          marker: {
            radius: 1,
            states: {
              hover: {
                radius: 2
              }
            }
          },
          fillOpacity: 0.25
        },
        column: {
          negativeColor: '#910000',
          borderColor: 'silver'
        }
      }
    };

    return chart;
  }.property('serverChart')
});
