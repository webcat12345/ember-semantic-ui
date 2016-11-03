import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Component.extend({
  chartService: Ember.inject.service('chart'),
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

  fetchChart: function () {
    var selectedMetricId = this.get('selectedMetricId');
    var selectedDimensionId = this.get('selectedDimensionId');
    var startDate = this.get('startDate');
    var windowStart = this.get('windowStart');
    var endDate = this.get('endDate');
    var windowEnd = this.get('windowEnd');
    var sortm = this.get('sortm');
    var sortd = this.get('sortd');
    var ds = this.get('dataset');
    var filter = this.get('filter');
    var topN = this.get('topN');
    var loadDone = this.get('loadDone');
    if (!selectedMetricId || !ds || !selectedDimensionId || !startDate || !endDate) {
      return;
    }
    this.set('loading', true);
    var _this = this;
    this.get('chartService').getChart({
      dataset_id: ds.id, metric_id: selectedMetricId, dimension_id: selectedDimensionId,
      start_date: windowStart, end_date: windowEnd, sortm: sortm, sortd: sortd, topN: topN, filter: filter
    })
      .then(function (data) {
          if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
            // do your destroying code setting stuff
            _this.set('loading', false);
            _this.set('serverChart', Ember.copy(data, true));
            if (loadDone) {
              loadDone(data);
            }
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
    for (var i = 0; i < markeddata.length; i++) {
      if (markeddata[i]['name'] === this.get('startDate') || markeddata[i]['name'] === this.get('endDate')) {
        markeddata[i]["marker"] = {fillColor: '#BF0B23', radius: 2, enabled: true};
      }
    }

    if (!schart) {
      return;
    }
    var otype = this.get('type');
    var type = null;
    if (otype) {
      type = otype;
    } else {
      type = schart.type;
    }
    var yAxis = schart.metric;
    var unit = yAxis.unit_type;
    var name = schart.name;
    if (!unit) {
      unit = '';
    }
    var step = 1;
    if (schart.series && schart.series[0]) {
      step = Math.ceil(schart.series[0].length / 20);
    }
    var _this = this;
    var chart = {
      title: {useHTML: true, text: name},
      exporting: {enabled: false},
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
          connectNulls: true,
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
