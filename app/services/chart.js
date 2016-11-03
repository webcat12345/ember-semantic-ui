import Ember from 'ember';
import ENV from 'datasenseui/config/environment';


const gradient = ['#7cb5ec', '#f7a35c', '#90ee7e', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
  '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'];

export default Ember.Service.extend({
  _charts: {},
  getChart: function (params) {
    if (params.group_by_id && params.group_vals) {
      return this.combineGroupCharts(params);
    } else {
      return this._getChart(params);
    }
  },
  _getChart: function (params) {
    const id = JSON.stringify(params);
    return new Promise((resolve, reject)=> {
      const ch = this.get('_charts')[id];
      if (ch === 'doing_call') {
        setTimeout(()=> {
          return resolve(this.getChart(params));
        }, 50);
      } else if (ch) {
        return resolve(Ember.$.extend(true, {}, ch));
      } else {
        this.get('_charts')[id] = 'doing_call';
        Ember.$.post(ENV.api_endpoint + '/chart/charts', {params: id})
          .then((data)=> {
            if (data.series) {
              this.formatData(data, params);
            }
            if (data.series && !data.new_series) {
              data.new_series = [{name: 'Overall', data: data.series}];
            }
            this.get('_charts')[id] = data;


            //get the series sorted by firstValue
            data.new_series = data.new_series.sort((x, y)=> {
              if (params.qp_params.funnel) {
                // we handle the case of a series not having data for the first day
                if (!x.data[0].dep_metrics && !y.data[0].dep_metrics) {
                  return 0;
                } else if (!x.data[0].dep_metrics) {
                  return 1;
                } else if (!y.data[0].dep_metrics) {
                  return -1;
                } else {
                  return y.data[0].dep_metrics.denominator - x.data[0].dep_metrics.denominator;
                }
              } else {
                return y.data[0].y - x.data[0].y;
              }
            });

            //assign color and name to each serie
            //and create a displayValue to each point of each series
            data.inparams = params;
            data.new_series = this.enrichSeries(data.new_series, params);

            return resolve(Ember.$.extend(true, {}, data));
          }, ()=> {
            //  error in chart api
            reject();
          });
      }
    });
  },

  enrichSeries: function (series, params) {
    return series.map((x, idx)=> {
      x.color = gradient[idx % gradient.length];
      x.params = params;
      if (x.name === 'Overall') {
        x.displayName = "All users";
      } else if (x.name === '----') {
        x.displayName = "Rest";
      } else {
        x.displayName = x.name;
      }
      x.data = x.data.map((y)=> {
        if (y.y) {
          if (y.dep_metrics.numerator) {
            //if it is percentage
            if (y.y > 0 && y.y < 0.01) {
              y.displayValue = '<0.01%';
            } else {
              y.displayValue = Highcharts.numberFormat(y.y, 2, '.', ',') + '%';
            }
          } else {
            if (y.y > 0 && y.y < 0.01) {
              y.displayValue = '<0.01';
            } else {
              y.displayValue = Highcharts.numberFormat(y.y, 2, '.', ',');
            }
          }
        } else {
          y.displayValue = "N/A";
        }
        return y;
      });
      return x;
    });
  },
  formatData: function (data, params) {
    if (!params.percentile && params.show_nulls) {
      return;
    }
    const newseries = [];
    let max = 0;
    for (let i = 0; i < data.series.length; i++) {
      if (data.series[i].y > max) {
        max = data.series[i].y;
      }
    }
    for (let i = 0; i < data.series.length; i++) {
      if (!params.show_nulls && (data.series[i].x === null || data.series[i].name === null)) {
        continue;
      }
      if (params.percentile) {
        data.series[i].origy = data.series[i].y;
        data.series[i].y = data.series[i].y * 100 / max;
      }
      newseries.push(data.series[i]);
    }
    data.series = newseries;
  },
  combineGroupCharts: function (params) {
    let gid = params.group_by_id;
    let gvals = params.group_vals;

    let gvarr = gvals.split(",,,");
    let f = params.filter;
    if (f) {
      f += ";";
    } else {
      f = '';
    }
    let allparams = $.extend({}, params);
    delete allparams.group_by_id;
    delete allparams.group_vals;

    let calls = [this._getChart(allparams)];
    for (let i = 0; i < gvarr.length; i++) {
      let newparams = $.extend({}, allparams);
      newparams.filter = f + gid + "==" + gvarr[i];
      calls.push(this._getChart(newparams));
    }
    return new Promise((resolve) => {
      Ember.RSVP.all(calls).then((charts) => {
        if (!charts) {
          return null;
        }
        let final = charts[0];

        for (let i = 1; i < charts.length; i++) {
          if (charts[i].new_series) {
            charts[i].new_series[0].name = gvarr[i - 1];
            final.new_series.push(charts[i].new_series[0]);
          } else {
            let series = [];
            for (let ll = 0; ll < final.new_series[0].length; ll++) {
              series.push({y: null, x: final.new_series[0][ll].x, name: final.new_series[0][ll].name});
            }
            final.new_series.push({data: series, name: gvarr[i - 1]});
          }
        }
        final.inparams = allparams;
        return resolve(final);
      });
    });

  }
});
