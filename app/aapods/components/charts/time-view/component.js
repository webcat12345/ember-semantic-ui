import Ember from 'ember';

const colors = {a: "#FF7070", b: "#9958F0"};

export default Ember.Component.extend({
  didInsertElement: function () {
    this.create_chart();
  },

  create_chart: function () {
    const _this = this;
    this.$().highcharts('StockChart', {
      navigator: {
        enabled: false
      },
      chart: {
        inputEnabled: false,
        events: {}
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      rangeSelector: {
        enabled: false
      },

      yAxis: {
        labels: {},
        min: 0,
        minRange: 0.1,
        opposite: false
      },

      plotOptions: {
        series: {
          connectNulls: true,
          allowPointSelect: false,
          marker: {
            enabled: true,
            radius: 0
          },

          point: {
            events: {
              click: function (event) {
                return _this.clickPoint(this, event);
              }
            }
          }
        }
      },

      tooltip: {
        positioner: bottomPositioner,
        useHTML: true,
        pointFormatter: function () {
          return '<span style="color:' + this.series.color + '">' + this.series.options.displayName + '</span>:<b>' + this.displayValue + '</b><br>';
        },
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
      },
      series: []
    });
    this.populateSeries();
  },


  populateSeries: function () {
    const chart = this.$().highcharts();
    this.get('series').forEach((serie)=> {
      if (serie.should_display) {
        serie.type = 'spline';
        chart.addSeries(JSON.parse(JSON.stringify(serie)), false);
      }
    });
    chart.redraw();
  },

  showHelpCompare: function () {
    const chart_state = this.get('chart_state');
    const chart = this.$().highcharts();

    if (chart_state === 'start_compare') {
      chart.showLoading('Click to select a point or drag to select a range');
      setTimeout(()=> {
        this.set("chart_state", "compare_started");
        if (chart.loadingShown) {
          chart.hideLoading();
        }
      }, 3000);
    }

  }.observes('chart_state'),

  modifiySeries: function () {
    const series = this.get('series');

    const chart = this.$().highcharts();
    const seriesChartName = chart.series.map((x)=>x.name);

    series.forEach((serie)=> {
      if (serie.should_display && seriesChartName.indexOf(serie.name) === -1) {
        serie.type = 'spline';
        chart.addSeries(JSON.parse(JSON.stringify(serie)));
      } else if (!serie.should_display && seriesChartName.indexOf(serie.name) !== -1) {
        chart.series.filter((x)=>x.name === serie.name)[0].remove();
      }
    });

  }.observes('series.@each.should_display'),


  apt: null,
  bpt: null,

  clickPoint: function (point, event) {
    //todo the logic is revert, we first set bpt and then apt to work woth the profile page
    const setPoint = this.get('setPoint');
    let name, value, whichPoint;
    value = point.series.options.params.dimension_id + '==' + point.name;
    name = point.name;
    if (point.series.options.params._segments) {
      value += ';' + point.series.options.params._segments.dim_id + '==' + point.series.name;
      name = point.series.name + ", " + name;
    }

    if (this.get('bpt')) {
      whichPoint = 'a';
      if (this.get('apt')) {
        this.get('apt').update({marker: {radius: 0, fillColor: null}}, true, true);
      }
      this.set('apt', point);
    } else {
      whichPoint = 'b';
      this.set('bpt', point);
    }
    setPoint(whichPoint, {
      value: value,
      name: name,
      pts: [point]
    });

    let marker = {
      radius: 4,
      fillColor: colors[whichPoint]
    };

    point.update({
      marker: marker
    }, true, true);

    point.unselect = this.get('unselect');
    point.this_context = this;

    const setCompare = this.get('setCompare');
    const compareObject = {
      metricId: point.series.options.params.metric_id,
      dimensionId: point.series.options.params.dimension_id,
      startDate: point.series.options.params.start_date,
      filter: point.series.options.params.filter,
      endDate: point.series.options.params.end_date
    };
    setCompare(compareObject);
  },


  unselect: function (pts) {
    this.update({marker: {radius: 0, fillColor: null}}, true, true);
    const _this = this.this_context;
    const setPoint = _this.get('setPoint');

    let whichPoint = 'a';

    if (pts === 'apt') {
      whichPoint = 'a';
      _this.set('apt', null);
    } else {
      whichPoint = 'b';
      _this.set('bpt', null);
      if (_this.get('apt')) {
        _this.get('apt').update({marker: {radius: 0, fillColor: null}}, true, true);
        _this.set('apt', null);
        setPoint('a', null);
      }
    }

    setPoint(whichPoint, null);
  }


});


const bottomPositioner = function (labelWidth, labelHeight, point) {
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
