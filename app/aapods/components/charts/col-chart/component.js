import Ember from 'ember';
import ENV from 'datasenseui/config/environment';
import {isDuplicate} from 'datasenseui/utils/obj-dup';

let aptcolor = "#FF7070";
let bptcolor = '#9958F0';
let linecolor = "#60C1F7";
let lineshadow = {
  color: "#88D5FF",
  offsetX: 0,
  offsetY: 5,
  opacity: 9,
  width: 0
};
let mainFillColor = {
  linearGradient: {
    x1: "50%",
    y1: "96%",
    x2: "50%",
    y2: "15%"
  },
  stops: [
    [0, "#FAFAFA"],
    [1, "#9FDAF8"]
  ]
};
let mainFillOpacity = 0.42;
let navigatorLineColor = 'grey';
let navigatorFillColor = 'lightgrey';
let navigatorFillOpacity = 0.05;


let bottomPositioner = function (labelWidth, labelHeight, point) {
  let tooltipY = 0;
  let tooltipX = 0;
  if (point.plotY + labelHeight > this.chart.plotHeight) {
    tooltipY = this.chart.plotTop + this.chart.plotHeight - 2 * labelHeight - 10;
  } else {
    tooltipY = this.chart.plotTop + this.chart.plotHeight - labelHeight;
  }
  if (point.plotX - labelWidth < this.chart.plotLeft) {
    tooltipX = this.chart.plotLeft;
  } else {
    tooltipX = point.plotX - labelWidth;
  }
  return {x: tooltipX, y: tooltipY};
};


export default Ember.Component.extend({
  chartService: Ember.inject.service('chart'),
  tagName: 'div',
  needs: ["application"],

  dataset: null,
  selectedMetricId: null,
  selectedDimensionId: null,
  startDate: null,
  endDate: null,
  topN: null,
  filter: null,
  query_id: null,
  num_id: null,
  denom_id: null,
  group_by_id: null,
  group_vals: null,

  type: null,
  simple: false,
  type_date_dimensions_selected: null,
  selectedDimensionDate: null,
  percentile: false,
  baseline: null,
  variation: null,
  exploreLink: false,
  showTitle: true,
  title: null,
  showTimeZoom: true,
  showDateCompare: true,
  rangeSelectEnabled: true,
  singlePtSelect: false,
  selectPtEnabled: true,
  showNulls: true,
  showLegend: false,
  yAxisName: null,
  yAxisEnabled: false,
  serverChart: null,
  compareSeries: null,
  loading: false,
  stackingType: null,
  qp_params: null,

  processFetchChart: function () {
    var setPoint = this.get('setPoint');
    if (setPoint) {
      setPoint('a', null);
      setPoint('b', null);
    }
    this.set('Apt', null);
    this.set('Bpt', null);

    Ember.run.once(this, 'fetchChart');
    return true;
  }.observes('serverParams'),


  watchSelectedDimension: function () {
    let chartType = this.get('type_date_dimensions_selected');
    if (chartType) {
      this.set('compareSeries', chartType.diff);
      this.set('selectedDimensionId', chartType.dimid);
    }
  }.observes('type_date_dimensions_selected'),

  reset_point_proxy: function () {
    const point = this.get('reset_point');
    if (point) {
      this.clickPoint(null, point, this, []);
      this.set('reset_point', null);
    }

  }.observes('reset_point'),

  clickPoint: function (event, ptType, _this, pointList, isInit, is_or_condition) {
    const chartProps = _this.get('chartProperties');
    var setPoint = _this.get('setPoint');
    if (ptType === 'Multi') {
      multiPoint();
    } else {
      singlePoint();
    }
    function singlePoint() {

      if (pointList.length !== 0 && _this.get('Apt') &&
        _this.get('Apt').value && _this.get('Bpt') && _this.get('Bpt').value) {
      }

      let value, name;

      const compareObject = {
        metricId: _this.get('selectedMetricId'),
        dimensionId: _this.get('selectedDimensionId'),
        startDate: _this.get('startDate'),
        filter: _this.get('filter'),
        endDate: _this.get('endDate')
      };

      if (_this.isWeek) {
        const start_week = moment(pointList[0].name).startOf('week').format('YYYY[-]MM[-]DD');
        const end_week = moment(pointList[0].name).endOf('week').format('YYYY[-]MM[-]DD');
        value = _this.get('dashboard.date') + '>=' + start_week + ';' + _this.get('dashboard.date') + '<=' + end_week;
        name = start_week + " to " + end_week;
        compareObject.dimensionId = _this.get('dashboard.date');
      } else if (pointList.length === 1) {
        //if we have only one point
        value = _this.get('selectedDimensionId') + '==' + pointList[0].name;
        name = pointList[0].name;
        if (chartProps.group_by_id && pointList[0].seriesName && pointList[0].seriesName !== 'Overall') {
          value += ';' + chartProps.group_by_id + '==' + pointList[0].seriesName;
          name = pointList[0].seriesName + ", " + name;
        }
      } else if (pointList.length === 0) {
        //if we are reseting them
        value = null;
        name = null;
      } else if (is_or_condition) {
        value = pointList.map((x)=>_this.get('selectedDimensionId') + '==' + x.name).join(',,');
        //  todo this function shouldn t be here
        if (pointList.length > 1 && moment(pointList[0].name, "YYYY-MM-DD", true).isValid()) {
          const day = moment(pointList[0].name).format('dddd');
          let isSame = true;
          pointList.forEach((x)=> {
            if (moment(x.name).format('dddd') !== day) {
              isSame = false;
            }
          });
          if (isSame) {
            name = "Typical " + day;
          }
        }
        if (!name) {
          name = pointList.map((x)=> x.name).join(' ');
        }

      } else {
        //if we have a range of points
        value = _this.get('selectedDimensionId') + '>=' + pointList[0].name + ';' +
          _this.get('selectedDimensionId') + '<=' + pointList[pointList.length - 1].name;
        name = pointList[0].name + " to " + pointList[pointList.length - 1].name;
      }

      const setCompare = _this.get('setCompare');
      setCompare(compareObject);

      let color;
      if (!ptType) {
        if (!chartProps.singlePtSelect && (!_this.get('Bpt') || (_this.get('Bpt') && !_this.get('Bpt').value))) {
          ptType = "Bpt";
        } else {
          ptType = "Apt";
        }
      }

      if (ptType === 'Apt') {
        color = aptcolor;
        setPoint('a', {
          value: value,
          name: name,
          pts: pointList
        });
        if (_this.get('Bpt') !== null && value && value === _this.get('Bpt')['value']) {
          _this.set('Bpt', null);
          setPoint('b', null);
        }
        _this.set('Apt', {
          value: value,
          name: name,
          pts: pointList
        });
      } else {
        color = bptcolor;
        setPoint('b', {
          value: value,
          name: name,
          pts: pointList
        });
        if (_this.get('Apt') !== null && value && value === _this.get('Apt')['value']) {
          _this.set('Apt', null);
          setPoint('a', null);
        }
        _this.set('Bpt', {
          value: value,
          name: name,
          pts: pointList
        });
      }


      pointList.forEach((pt, idx)=> {
        let marker = {
          enabled: true,
          symbol: 'circle',
          radius: 4,
          fillColor: color,
          states: {
            hover: {
              fillColor: color,
              lineColor: color
            }
          }
        };

        pt.color = color;
        if (isInit) {
          pt.marker = marker;
        } else {
          pt.update({
            lineColor: color,
            lineWidth: "2",
            shadow: {
              color: color,
              offsetX: 0,
              offsetY: 5,
              opacity: 9,
              width: 0
            },
            marker: marker
          }, false, true);
        }
        //pt.graphic.states.hover.fillColor = color;
        if (idx !== pointList.length - 1) {
          pt.segmentColor = color;
        } else {
          if (!_this.get('type_date_dimensions_selected') ||
            ["Year over Year", "Month over Month", "Week over Week"].indexOf(_this.get('type_date_dimensions_selected').id) === -1) {
            pt.segmentColor = linecolor;
          }
        }
      });
      //put a random number so this if works Apts.indexOf(pt) === Apts.length - 1
      let Apts = [{name: null}], Bpts = [{name: null}];
      if (_this.get("Apt")) {
        Apts = _this.get("Apt").pts;
      }
      if (_this.get("Bpt")) {
        Bpts = _this.get("Bpt").pts;
      }
      //clean all the other points. Ui pb if we clean only the previous ones.
      if (!isInit) {

        _this.$('.highcharts').highcharts().series[0].points.forEach((pt)=> {
          color = '#ccc';
          if (!Apts.find(function (apt) {
              return pt.name === apt.name;
            }) && !Bpts.find(function (bpt) {
              return pt.name === bpt.name;
            })) {
            pt.color = color;
            pt.update({
              lineColor: linecolor,
              lineWidth: "2",
              shadow: lineshadow,
              marker: {
                radius: 2,
                enable: true,
                fillColor: color,
                states: {
                  hover: {
                    fillColor: color,
                    lineColor: color
                  }
                }
              }
            }, false, true);
            pt.segmentColor = color;
          } else if ((Apts[Apts.length - 1] && Apts[Apts.length - 1].name === pt.name) ||
            (Bpts[Bpts.length - 1] && Bpts[Bpts.length - 1].name === pt.name)) {
            pt.segmentColor = color;
          } else {

          }
        });
        _this.$('.highcharts').highcharts().series[0].points[0].update({}, true, true);
      }
    }

    function multiPoint() {
      const points = [];
      for (let key in pointList) {
        const point = {};
        point.name = _this.get('chartProperties.group_by.name') + ' : ' + key;
        point.value = _this.get('chartProperties.group_by.id') + '==' + key;
        point.pts = pointList[key];
        points.push(point);
      }

      const compareObject = {
        metricId: _this.get('selectedMetricId'),
        dimensionId: _this.get('chartProperties.group_by.id'), // _this.get('selectedDimensionId'),
        startDate: points[0].pts[0].name,
        filter: _this.get('filter'),
        endDate: points[0].pts[points[0].pts.length - 1].name
      };

      const setCompare = _this.get('setCompare');
      setCompare(compareObject);

      setPoint('a', points[0]);
      _this.set('Apt', points[0]);
      setPoint('b', points[1]);
      _this.set('Apt', points[1]);


      const chart = points[0].pts[0].series.chart;
      $('#rectangle').remove();
      const rectangle = chart.renderer.rect(0, 0, 0, 0).css({
        stroke: 'red',
        strokeWidth: '.8',
        fill: 'grey',
        fillOpacity: '.5'
      }).attr({id: "rectangle"}).add();


      var xMin = chart.xAxis[0].translate((event.xAxis[0] || chart.xAxis[0]).min),
        xMax = chart.xAxis[0].translate((event.xAxis[0] || chart.xAxis[0]).max),
        yMin = chart.yAxis[0].translate(chart.yAxis[0].min),
        yMax = chart.yAxis[0].translate(chart.yAxis[0].max);

      rectangle.attr({
        x: xMin + chart.plotLeft,
        y: chart.plotHeight + chart.plotTop - yMax,
        width: xMax - xMin,
        height: yMax - yMin
      });

      rectangle.toFront();
    }
  },


  previous_chart_state: null,
  chart_state_handler: function () {

    if (!this.$('.highcharts')) {
      return;
    }

    const chart_state = this.get('chart_state');

    if (this.get('previous_chart_state') === chart_state) {
      return;
    } else {
      this.set('previous_chart_state', chart_state);
    }

    const chart_obj = this.$('.highcharts').highcharts();

    if (chart_state === 'start_compare') {
      chart_obj.showLoading('Click to select a point or drag to select a range');
      setTimeout(()=> {
        this.set("chart_state", "compare_started");
        if (chart_obj.loadingShown) {
          chart_obj.hideLoading();
        }
      }, 3000);
      //  the hide loading is handled in chart.events.click and in selectPointsByDrag
    }

  }.observes('chart_state'),

  Apt: null,
  Bpt: null,
  preColorA: null,
  preColorB: null,

  preColor: function (series) {
    let A = this.get('preColorA');
    let B = this.get('preColorB');
    let selectedSeries = this.get('selectedSeries');
    if (!A && !B) {
      return;
    }
    let apts = [];
    let bpts = [];
    let is_a_or_condition = false;
    let is_b_or_condition = false;
    series.forEach((serie)=> {
      if (selectedSeries) {
        serie.shouldvisible = serie.name === selectedSeries;
      } else {
        serie.shouldvisible = true;
      }
      if (serie.shouldvisible) {
        serie.data.forEach((pt)=> {
          if (A && A.length === 1 && A[0].value === pt.name) {
            apts.push(pt);
          } else if (A && A.forEach && A.length > 1) {
            let match = 0;
            A.forEach((abucket)=> {
              if (abucket.op === '>=' && pt.name >= abucket.value) {
                match++;
              } else if (abucket.op === '<=' && pt.name <= abucket.value) {
                match++;
              } else if (abucket.op === '=' && pt.name === abucket.value) {
                apts.push(pt);
                is_a_or_condition = true;
              }
            });
            if (match === A.length) {
              apts.push(pt);
            }
          }

          if (B && B.length === 1 && B[0].value === pt.name) {
            bpts.push(pt);
          } else if (B && B.forEach && B.length > 1) {
            let match = 0;
            B.forEach((bbucket)=> {
              if (bbucket.op === '>=' && pt.name >= bbucket.value) {
                match++;
              } else if (bbucket.op === '<=' && pt.name <= bbucket.value) {
                match++;
              } else if (bbucket.op === '=' && pt.name === bbucket.value) {
                bpts.push(pt);
                is_b_or_condition = true;
              }
            });
            if (match === B.length) {
              bpts.push(pt);
            }
          }
        });
      }
    });

    if (apts && apts.length > 0) {
      this.clickPoint(null, "Apt", this, apts, true, is_a_or_condition);
    }
    if (bpts && bpts.length > 0) {
      this.clickPoint(null, "Bpt", this, bpts, true, is_b_or_condition);
    }
  },
  fetchChart: function () {
    let sparams = this.get('serverParams');
    if (!sparams) {
      return;
    }

    this.set('loading', true);
    this.set('error', false);
    this.get('chartService').getChart(sparams).then((data)=> {
        if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
          // do your destroying code setting stuff
          this.set('loading', false);
          this.set('serverChart', data);
          this.set('serverNewseries', data.new_series);
          this.set('error', false);
          // indicate that chart has loaded
          this.sendAction('onChartLoad');
        }
      }, (error) => {
        this.set('error', true);
        this.set('loading', false);
        console.log(error);
      }
    );
  },
  final_name: function () {
    const cn = this.get('chart_name');
    const schart = this.get('serverChart');
    if (cn) {
      return cn;
    } else {
      let name = schart.metric.name;
      name += " by " + schart.dimension.name;
      if (this.get('filter')) {
        name += " filtered by " + this.get('filter').split(';').map((x)=> {
            return x.split('==')[1];
          }).join(' and ');
      }
      return name;
    }
  }.property('chart_name', 'serverChart', 'filter'),

  type_date_dimensions: function () {
    const chartProps = this.get('chartProperties');
    if (chartProps.isDate) {
      return [
        {
          name: "Day by day",
          id: "Day by day",
          dimid: chartProps.dashboard.get('date'),
          diff: null
        },
        {
          name: "Week by week",
          id: "Week by week",
          dimid: chartProps.dashboard.get('week'),
          diff: null
        },
        {
          id: "Year over Year",
          name: "Year over Year",
          dimid: chartProps.dashboard.get('date'),
          diff: {
            count: 364,
            period: "days"
          }
        },
        {
          id: "Month over Month",
          name: "Month over Month",
          dimid: chartProps.dashboard.get('date'),
          diff: {
            count: 1,
            period: "months"
          }
        },
        {
          id: "Week over Week",
          name: "Week over Week",
          dimid: chartProps.dashboard.get('date'),
          diff: {
            count: 1,
            period: "weeks"
          }
        }
      ];
    }
    return null;
  }.property('chartProperties'),
  addMySeries: function (chartProps, schart) {
    // place timestamp in chartProps to ensure new series is rendered
    chartProps['timestamp'] = Date.now();

    if (chartProps.multi_factor) {
      let finalseries = [];
      if (!schart.new_series) {
        return;
      }

      schart.new_series.forEach((serie)=> {
        serie.data = serie.data.map((x)=> {
          let value;
          if (chartProps.isWeek) {
            value = moment(x.name).unix() * 1000;
          } else if (chartProps.isDate) {
            value = new Date(x.name).getTime();
          } else {
            value = x.name;
          }
          if (x.y === undefined || x.y === null) {
            x.y = 0;
          }

          return {
            name: x.name,
            size: x.size,
            y: x.y,
            origy: x.origy,
            seriesName: serie.name,
            dep_metrics: x.dep_metrics,
            x: value
          };
        });
        finalseries.push(serie);
      });
      // if ab_test we want to order the lines so baseline is always first
      if (this.get('variation') && this.get('baseline') && schart.new_series[0].name !== this.get('baseline')) {
        const b = finalseries[0];
        finalseries[0] = finalseries[1];
        finalseries[1] = b;
      }
      chartProps.myseries = finalseries;
    } else {
      if (!schart.new_series) {
        return;
      }
      let comparepts = {};
      let myseries = schart.new_series[0].data.map((x, idx, arr)=> {
        let value;
        let name = x.name;
        let dep_metrics = x.dep_metrics;
        if (chartProps.isWeek) {
          value = moment(x.name).unix() * 1000;
        } else if (chartProps.isDate) {
          value = new Date(x.name).getTime();
        } else if (chartProps.charttype === 'funnel') {
          value = "Step " + Number(x.name).toFixed(0);
          name = value;
          if (idx > 0) {
            dep_metrics.prevConversion = x.y * 100 / arr[idx - 1].y;
          } else if (idx < arr.length - 1) {
            dep_metrics.nextConversion = arr[idx + 1].y * 100 / x.y;
          }
        } else {
          value = x.name;
        }
        let spt = {
          name: name,
          size: x.size,
          y: x.y,
          x: value,
          dep_metrics: dep_metrics,
          origy: x.origy,
          orig: value
        };
        if (chartProps.compareSeries) {
          comparepts[moment(value).unix()] = spt;
        }
        return spt;
      });
      if (chartProps.compareSeries) {
        let currseries = [];
        let prevseries = [];
        for (let ci = 0; ci < myseries.length; ci++) {
          let spt = myseries[ci];
          let next = moment(spt.x).add(chartProps.compareSeriesCount, chartProps.compareSeriesPeriod).unix();
          if (comparepts[next]) {
            myseries[ci].x = comparepts[next].x;
            prevseries.push(myseries[ci]);
            currseries.push($.extend({}, comparepts[next]));
          }
        }
        chartProps.myseries = [{name: "Current", data: currseries}, {name: "Previous", data: prevseries}];
      } else {
        chartProps.myseries = [{name: "Overall", data: myseries}];
      }
    }
  },
  serverParams: null,
  createServerParams: function () {
    var selectedMetricId = this.get('selectedMetricId');
    var selectedDimensionId = this.get('selectedDimensionId');
    var startDate = this.get('startDate');
    var endDate = this.get('endDate');
    var sortm = this.get('sortm');
    var sortd = this.get('sortd');
    var ds = this.get('dataset');
    var filter = this.get('filter');
    var query_id = this.get('query_id');
    var num_id = this.get('num_id');
    var denom_id = this.get('denom_id');
    var topN = this.get('topN');
    var cache = this.get('cache');

    var spark_only = this.get('spark_only');
    var group_by_id = this.get('group_by_id');
    var group_vals = this.get('group_vals');
    if (!selectedMetricId || !ds || !selectedDimensionId || !startDate || !endDate) {
      this.set('serverParams', null);
    }

    if (!group_by_id || group_by_id === "undefined") {
      group_by_id = null;
    }
    if (!spark_only || spark_only === "undefined") {
      spark_only = null;
    }
    if (!topN || topN === "undefined") {
      topN = null;
    }
    if (!filter || filter === "undefined") {
      filter = null;
    }
    if (!sortd || sortm === "undefined") {
      sortd = null;
    }
    if (!sortm || sortm === "undefined") {
      sortm = null;
    }

    if (!cache || cache === "undefined") {
      cache = null;
    }

    if (this.get('baseline') && this.get('variation') &&
      this.get('baseline') !== 'undefined' &&
      this.get('variation') !== 'undefined') {
      if (filter === null) {
        filter = '';
      }
      if (filter !== '') {
        filter += ';';
      }
      filter += this.get('group_by_id') + '==' + this.get('baseline') + ',,' +
        this.get('group_by_id') + '==' + this.get('variation');
    }
    if (this.get('charttype') !== 'abtest' && !group_vals) {
      group_by_id = null;
    }
    let inparams = {
      dataset_id: ds.id,
      metric_id: selectedMetricId,
      dimension_id: selectedDimensionId,
      group_by_id: group_by_id,
      group_vals: group_vals,
      start_date: startDate,
      end_date: endDate,
      sortm: sortm,
      sortd: sortd,
      cache: cache,
      topN: topN,
      filter: filter,
      query_id: query_id,
      num_id: num_id,
      denom_id: denom_id,
      spark_only: spark_only,
      qp_params: this.get('qp_params'),
      percentile: this.get('percentile'),
      show_nulls: this.get('showNulls')
    };
    if (this.get('group_by_id')) {
      inparams._segments = {dim_id: this.get('group_by_id')}
    }
    let lastparams = this.get('serverParams');
    if (!isDuplicate(inparams, lastparams, ['qp_params'])) {
      this.set('serverParams', inparams);
    }
  }.observes('selectedMetricId', 'selectedDimensionId', 'startDate', 'endDate',
    'topN', 'group_by_id', 'group_vals', 'compareSeries', 'baseline', 'variation', 'percentile', 'showNulls',
    'sortd', 'sortm', 'filter', 'query_id', 'qp_params', 'num_id', 'denom_id', 'cache', 'spark_only', 'charttype').on('init'),

  addTooltip: function (chartProps, schart) {
    if (chartProps.multi_factor) {
      if (chartProps.percentile) {
        chartProps.tooltip = {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.1f}%</b> ({point.origy:.1f})<br/>',
          shared: schart.new_series.length <= 10,
          positioner: bottomPositioner
        };
      } else if (chartProps.charttype === 'abtest') {
        chartProps.tooltip = {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:.1f})<br/>',
          shared: schart.new_series.length <= 10,
          positioner: bottomPositioner
        };
      } else {
        chartProps.tooltip = {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y: .4f}</b> <br/>',
          shared: schart.new_series.length <= 10,
          positioner: bottomPositioner
        };
      }
    } else {
      if (chartProps.compareSeries) {
        chartProps.tooltip = {
          shared: true,
          useHTML: true,
          positioner: bottomPositioner,
          formatter: function () {
            return '<b>' + new Date(this.points[0].point.orig).toUTCString().split(' ').slice(0, 4).join(' ') + '</b><br>' +
              chartProps.yAxisName + ' = ' + this.points[0].y + chartProps.unit + '<br>&nbsp;<br>' +
              '<b>' + new Date(this.points[1].point.orig).toUTCString().split(' ').slice(0, 4).join(' ') + '</b><br>' +
              chartProps.yAxisName + ' = ' + this.points[1].y + chartProps.unit + '<br>';
          }
        };
      } else if (chartProps.charttype === 'funnel') {
        chartProps.tooltip = {
          positioner: bottomPositioner,
          formatter: function () {
            let f = '<b>' + this.point.name + '</b><br>Sessions = ' + this.y.toFixed(0).toString() + '<br>';

            if (this.point.dep_metrics.prevConversion) {
              f += 'Conversion from previous step = ' + this.point.dep_metrics.prevConversion.toFixed(2) + '%<br>';
            }
            if (this.point.dep_metrics.nextConversion) {
              f += 'Conversion to next step = ' + this.point.dep_metrics.nextConversion.toFixed(2) + '%<br>';
            }
            return f;
          }
        };
      } else {
        chartProps.tooltip = {
          positioner: bottomPositioner,
          formatter: function () {
            if (chartProps.isDate) {
              return '<b>' + new Date(this.x).toUTCString().split(' ').slice(0, 4).join(' ') + '</b><br>' +
                chartProps.yAxisName + ' = ' + this.y + chartProps.unit + '<br>';
            } else if (chartProps.percentile) {
              return '<b>' + chartProps.xAxisName + " = " + this.point.name + '</b><br>' +
                chartProps.yAxisName + ' = ' + this.y.toFixed(2).toString() + '% (' + this.point.origy + ')<br>';
            } else {
              const dep = this.point.dep_metrics;
              let extraProp = null;
              if (dep) {
                for (let key in dep) {
                  if (dep.hasOwnProperty(key)) {
                    extraProp = dep[key];
                    break;
                  }
                }
              }
              return '<b>' + this.point.name + '</b><br>' + chartProps.yAxisName + ' = ' +
                this.y.toFixed(2).toString() +
                chartProps.unit + (extraProp ? " (" + extraProp.toFixed(2).toString() + ")" : '') + '<br>';
            }
          }
        };
      }
    }
  },
  chartProperties: null,
  setChartProperties: function () {
    const dashboard = this.get('dashboard');
    const selectedDimensionId = this.get("selectedDimensionId");
    let isDate = this.get('charttype') !== 'advanced_query' &&
      this.get('charttype') !== 'funnel' &&
      (selectedDimensionId === dashboard.get('week') || selectedDimensionId === dashboard.get('date'));

    let props = {
      group_by_id: this.get('group_by_id'),
      group_vals: this.get('group_vals'),
      dashboard: dashboard,
      isDate: isDate,
      isWeek: selectedDimensionId === dashboard.get('week'),
      label: {},
      multi_factor: this.get('group_by_id') ? true : false,
      percentile: this.get('percentile'),
      height: 400,
      type: this.get('type'),
      title: this.get('title'),
      yAxisTitleEnabled: this.get('yAxisEnabled'),
      xAxisTitleEnabled: this.get('charttype') === 'advanced_query' ? true : isDate,
      xAxisLabelsEnabled: !this.get('simple'),
      xAxisType: isDate ? 'datetime' : "category",
      yAxisName: this.get('yAxisName'),
      xAxisName: this.get('xAxisName'),
      compareSeries: this.get('compareSeries'),
      maxYAxis: this.get('maxYAxis'),
      charttype: this.get('charttype'),
      stackingType: this.get('stackingType'),
      showLegend: false,
      fillOpacity: mainFillOpacity,
      fillColor: mainFillColor,
      selectPtEnabled: this.get('selectPtEnabled'),
      singlePtSelect: this.get('singlePtSelect'),
      rangeSelectEnabled: this.get('rangeSelectEnabled'),
      showTimeZoom: this.get('showTimeZoom')
    };
    if (props.compareSeries) {
      props.compareSeriesCount = props.compareSeries.count;
      props.compareSeriesPeriod = props.compareSeries.period;
    }
    if (props.multi_factor || props.compareSeries || this.get('showLegend')) {
      props.showLegend = true;
    }
    if (props.percentile) {
      props.maxYAxis = 100;
    }

    if (!props.yAxisName) {
      props.yAxisName = 'y';
    }

    if (!props.xAxisName) {
      props.xAxisName = 'x';
    }

    if (props.isWeek) {
      props.label = {week: '%Y-W%W'};
    } else if (props.isDate) {
      props.label = {day: '%e%b'};
    }

    if (!props.type && props.isWeek) {
      props.type = "column";
    }
    if (!props.stackingType && props.charttype === 'abtest') {
      props.stackingType = 'percent';
    }

    const schart = this.get('serverChart');
    if (schart) {
      props.group_by = schart.group_by;
      props.unit = schart.metric.unit_type ? schart.metric.unit_type : '';
      if (!props.yAxisName) {
        props.yAxisName = schart.metric.name;
      }
      if (!props.xAxisName) {
        props.xAxisName = schart.dimension.name;
      }
    }
    let serieslength = 1;
    if (schart && schart.new_series) {
      serieslength = schart.new_series.length;
    }

    if (props.multi_factor && serieslength > 10) {
      props.height = 600;
    }
    if (props.type === 'coloredline') {
      props.type = 'line';
    }
    if (props.percentile) {
    } else if (props.type === 'line' && serieslength === 1 && !props.compareSeries) {
      props.type = 'areaspline';
    } else if (props.stackingType) {
      props.type = 'areaspline';
    } else if (props.type === 'line') {
      props.type = 'spline';
    }
    if (serieslength !== 1) {
      props.fillColor = null;
      props.fillOpacity = null;
    }
    if (props.type === 'pie') {
      props.isDate = false;
    }
    props.inparams = this.get('serverParams');
    if (schart) {
      this.addMySeries(props, schart);
      this.addTooltip(props, schart);
    }

    //Check  something  changed as this is getting  invoked even when nothingchanged and reloading the chart
    //reloading chart does away withthe compare selections
    let lastprops = this.get('chartProperties');

    if (isDuplicate(props, lastprops, ['inparams'])) {
      return;
    }
    this.set('chartProperties', props);
    return props;
  }.observes('serverChart', 'serverNewseries', 'type', 'stackingType', 'compareSeries'),
  hightSlide: function (title, body, selectedPoints, e, size = 150) {
    let _this = this;
    let X, Y;
    if (e.originalEvent) {
      X = e.originalEvent.pageX;
      Y = e.originalEvent.pageY;
    } else {
      X = e.pageX;
      Y = e.pageY;
    }

    hs.htmlExpand(null, {
      pageOrigin: {
        x: X,
        y: Y
      },
      headingText: title,
      maincontentText: body,
      width: size,
      zIndexCounter: 9999
    }, {clickPoint: _this.clickPoint, _this: this, event: e, _this2: _this, selectedPoints: selectedPoints});
  },
  selectPointsByDrag: function (_this, chart, e) {
    let chartProps = _this.get('chartProperties');
    if (_this.$('.highcharts').highcharts().loadingShown) {
      _this.set("chart_state", "compare_started");
      _this.$('.highcharts').highcharts().hideLoading();
      return false;
    }

    if (!chartProps.rangeSelectEnabled) {
      return true;
    }
    const filtered_series = chart.series.filter((x)=>x.visible && x.name !== "Navigator");
    if (filtered_series.length > 2) {

      const title = "<span>Error</span><span class='fa fa-times pull-right' style='margin-left:10.4em; cursor: hand' onclick='return hs.close(this)' ></span>";
      const body = "You can only compare 2 lines.";
      _this.hightSlide(title, body, [], e);
    } else if (chartProps.compareSeries) {

      const title = "<span>Error</span><span class='fa fa-times pull-right' style='margin-left:10.4em; cursor: hand' onclick='return hs.close(this)' ></span>";
      const body = "Select two points. Range why not yet supported here.";
      _this.hightSlide(title, body, [], e);
    } else if (filtered_series.length === 2) {
      let selectedPoints = {};
      Highcharts.each(filtered_series, function (series) {
        selectedPoints[series.name] = [];
        Highcharts.each(series.points, function (point) {
          if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max && !selectedPoints[series.name].findBy('name', point.name)) {
            selectedPoints[series.name].push(point);
          }
        });
      });
      const serieA = selectedPoints[filtered_series[0].name];
      _this.addRangeMultiSeriesPoints(e, serieA[0].name, serieA[serieA.length - 1].name, selectedPoints, chartProps.group_by);
    } else {
      if (chartProps.isDate && !chartProps.isWeek) {
        let selectedPoints = [];
        Highcharts.each(filtered_series, function (series) {
          Highcharts.each(series.points, function (point) {
            if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max && !selectedPoints.findBy('name', point.name)) {
              selectedPoints.push(point);
            }
          });
        });
        _this.clickPoint(e, null, _this, selectedPoints);
      }
    }
    return false; // Don't zoom
  },

  addRangeMultiSeriesPoints: function (e, omin, omax, selectedPoints, group_name) {
    let _this = this;
    const names = [];
    for (let serieName in selectedPoints) {
      names.push(serieName);
    }
    let min = moment(omin).format("MMM Do");
    let max = moment(omax).format("MMM Do");
    const title = "<span>" + min + " to " + max + "</span><span class='fa fa-times pull-right' style='margin-left:4.4em; cursor: hand' onclick='return hs.close(this)' ></span>";
    const body = "<b>" + group_name + " :</b> <span style='color:#4183c4'>" + names.join("</span><br><b>" + group_name + " : </b><span style='color:#4183c4'>") + "</span><br><br><button class='btn btn-default' onclick='(function(){const ctx = hs.getExpander(this).custom;ctx.clickPoint(ctx.event,\"Multi\",ctx._this2,ctx.selectedPoints); hs.close(this)}).call(this)'> Define points </button><br>";

    _this.hightSlide(title, body, selectedPoints, e, 240);
  },
  addToPoints: function (_this, pt, event) {
    let chartProps = _this.get('chartProperties');
    if (!chartProps.selectPtEnabled) {
      return true;
    }

    let selectedPoints = [pt];

    const filtered_series = pt.series.chart.series.filter((x)=>x.visible && x.name !== "Navigator");
    let title, body;

    if (_this.get('type_date_dimensions_selected') &&
      ["Year over Year", "Month over Month", "Week over Week"].indexOf(_this.get('type_date_dimensions_selected').id) !== -1) {
      const index = pt.series.data.indexOf(pt);
      if (filtered_series[0].data[index].x > filtered_series[1].data[index].x) {
        selectedPoints = [filtered_series[0].data[index]];
      } else {
        selectedPoints = [filtered_series[1].data[index]];
      }
    }
    if (filtered_series.length > 1 && chartProps.charttype === 'abtest') {
      title = "<span>Error</span><span class='fa fa-times pull-right' style='margin-left:10.4em; cursor: hand' onclick='return hs.close(pt)' ></span>";
      body = "Try selecting a range";
      _this.hightSlide(title, body, selectedPoints, event, 200);
    } else {
      _this.clickPoint(event, null, _this, selectedPoints);
    }
    return false;
  },
  loadChart: function (_this, chart) {
    if (_this.get('chartProperties.charttype') === 'abtest') {
      chart.visible = true;

      const labelText = chart.renderer.text('Select two values', null, null)
        .css({})
        .attr({}).add();
      labelText.align(Highcharts.extend(labelText.getBBox(), {
        align: 'right',
        x: -40, // offset
        verticalAlign: 'right',
        y: 80 // offset
      }), null, 'spacingBox');
      $(labelText.element).hide();

      const labelButton = chart.renderer.button('Make Selection', null, null, ()=> {
        chart.series.forEach((serie)=> {
          $(labelText.element).toggle();
          if (chart.visible) {
            serie.setVisible(false, false);
          } else {
            serie.setVisible(true, false);
          }
        });
        chart.visible = !chart.visible;
        chart.redraw();

      })
        .css({color: "red"})
        .attr({class: "myclass"})
        .add();

      labelButton.align(Highcharts.extend(labelButton.getBBox(), {
        align: 'right',
        x: -40, // offset
        verticalAlign: 'right',
        y: 30 // offset
      }), null, 'spacingBox');
    }
  },
  chart: function () {
    var _this = this;
    const chartProps = this.get('chartProperties');
    if (!chartProps || !chartProps.myseries) {
      return null;
    }
    this.preColor(chartProps.myseries);
    var chart = {
      isDate: chartProps.isDate,
      title: {useHTML: true, text: chartProps.title},
      chart: {
        height: chartProps.height,
        inputEnabled: false,
        type: chartProps.type.toLowerCase(), zoomType: "x",
        events: {
          selection: function (e) {
            return _this.selectPointsByDrag(_this, this, e);
          },
          load: function () {
            return _this.loadChart(_this, this);
          },
          click: function (event) {
            if (this.loadingShown) {
              _this.set("chart_state", "compare_started");
              this.hideLoading();
            }
          }
        }
      },
      tooltip: chartProps.tooltip,
      rangeSelector: {
        enabled: chartProps.showTimeZoom
      },
      xAxis: {
        type: chartProps.xAxisType,
        title: {
          enabled: chartProps.xAxisTitleEnabled,
          text: chartProps.xAxisName
        },
        labels: {
          enabled: chartProps.xAxisLabelsEnabled,
          rotation: 0
        },
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        tickLength: 0,
        lineColor: 'transparent',
        dateTimeLabelFormats: chartProps.label
      },
      yAxis: {
        min: 0,
        max: chartProps.maxYAxis,
        title: {
          enabled: chartProps.yAxisTitleEnabled,
          text: chartProps.yAxisName
        },
        labels: {
          formatter: function () {
            return Highcharts.numberFormat(this.value, 2, '.', ',');
          }
        },
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        minorTickLength: 0,
        tickLength: 0,
        lineColor: 'transparent'
      },
      series: chartProps.myseries,
      navigator: {
        series: {
          type: 'areaspline',
          color: navigatorLineColor,
          fillOpacity: navigatorFillOpacity,
          fillColor: navigatorFillColor
        }
      },
      legend: {
        enabled: chartProps.showLegend,
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: 0,
        y: 100,
        'useHTML': true,
        labelFormatter: function () {
          return '<span class="chart--label">' + this.name + '</span>';
        }
      },
      plotOptions: {
        series: {
          stacking: chartProps.stackingType,
          allowPointSelect: false,
          connectNulls: true,
          point: {
            events: {
              click: function (event) {
                return _this.addToPoints(_this, this, event);
              }
            }
          },
          fillOpacity: chartProps.fillOpacity,
          fillColor: chartProps.fillColor,
          marker: {
            enabled: true,
            states: {
              select: {
                fillColor: 'black'
              }
            }
          }
        },
        column: {
          minPointLength: 5
        }
      },
      loading: {
        hideDuration: 500,
        showDuration: 500,
        labelStyle: {
          color: 'white'
        },
        style: {
          backgroundColor: 'black'
        }
      }
    };


    if (this.get('config')) {
      Ember.merge(chart, this.get('config'));
    }
    return chart;
  }.property('chartProperties'),
  actions: {
    pinChart: function () {
      const p = this.get('pinChart');
      if (p) {
        p();
      }
    }
  }
});

