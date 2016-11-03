import Ember from 'ember';
import ChartController from '../mixin';

const FunnelMetric = Ember.ObjectProxy.extend({
  type: 'Funnel',
  data_type: 'rate',
  calculation: {
    type: 'Ratio',
    ratio_type: 'Rate',
    numerator: Ember.computed.readOnly('dashboard.countmetric'),
    denominator: Ember.computed.readOnly('dashboard.countmetric')
  }
});

export default Ember.Controller.extend(ChartController, {
  chartService: Ember.inject.service('chart'),

  init: function () {
    this._super();
    const queryParams = this.get('queryParams');
    queryParams.forEach((param)=> {
      if (param !== 'series_display') {
        this.addObserver(param, this, 'getChartData');
      }
    });
  },

  redraw_chart: function () {
    this.send('draw');
  }.observes('qstartDate', 'qendDate', 'type_date_dimensions_selected'),

  _s4: function () {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  },

  generateID: function () {
    // generate a "random" mongo-like ID
    return this._s4() + this._s4() + this._s4() +
      this._s4() + this._s4() + this._s4();
  },

  parseAdvancedFilter: function (givenFilterStr) {
    let filter_comp = [];
    if (givenFilterStr) {
      filter_comp = givenFilterStr.split(';');
    }
    let dyn_dims = {};
    let new_filter = '';
    const session_id = this.get('model.dashboard.session_table.id_col');
    for (let i = 0; i < filter_comp.length; i++) {
      const dim_id = this.generateID();
      let new_dim = {
        'name': 'Session.' + dim_id,
        'level': session_id,
        'func': 'exists',
        'args': [],
        'filter': filter_comp[i]
      };
      dyn_dims[dim_id] = new_dim;
      if (new_filter) {
        new_filter += ';';
      }
      new_filter += dim_id + '==true';
    }
    return {'dims': dyn_dims, 'new_filter': new_filter};
  },

  prepare_params: function () {
    let sparams = {
      "dataset_id": this.get('model.dataset_id'),
      "metric_id": this.get('sm'),
      "dimension_id": this.get('sd'),
      "_segments": null,
      "group_vals": null,
      "start_date": this.get('startDate'),
      "end_date": this.get('endDate'),
      "sortd": "Descending",
      "topN": 20000,
      "filter": this.get('f'),
      "spark_only": true,
      "show_nulls": true
    };
    if (this.get('group_by_id')) {
      sparams._segments = {"dim_id": this.get('group_by_id'), '_limit': 20};
      if (this.get('search_string')) {
        sparams['_segments']['_like'] = this.get('search_string');
      }
    }


    let sm = this.get('sm');
    if (!sm) {
      return null;
    }
    let qsm = this.get('allmetrics').findBy('id', sm);
    if (qsm && qsm.get('type') === 'Funnel') {
      sparams['metric_id'] = this.get('model.dashboard.countmetric');
      sparams['query_id'] = 'path_conversion_rate';
      sparams['qp_params'] = {funnel: qsm.get('id')};
    } else {
      sparams['metric_id'] = qsm.get('id');

      if (this.get('qsm') && this.get('sd') &&
        $.inArray(this.get('model.dataset_id'), ['thredup_all', 'whoeasy_all', 'dictionary_demo', 'nvidia']) > -1) {
        sparams['query_id'] = 'advanced_query';
        const filter_dims = this.parseAdvancedFilter(this.get('f'));
        sparams['qp_params'] = {
          'dynamic_dims': filter_dims['dims'],
          'x': {'dim_id': this.get('sd'), 'min': null, 'max': null, 'bin_size': 1, 'scale': 1},
          'y': {
            'func': this.get('qsm').get('calculation.reducer'),
            'filter': null
          },
          'limit': null
        };
        sparams['filter'] = filter_dims['new_filter'];

        // Y aggregation parameters
        let metric_type = this.get('qsm').get('calculation.type');
        if (metric_type === 'Column') {
          sparams['qp_params']['y']['args'] = [this.get('qsm').get('calculation.colname')];
        } else if (metric_type === 'Ratio') {
          this.set('error', true);
          sparams['qp_params']['y']['func'] = 'ratio';
          sparams['qp_params']['y']['args'] = [this.get('qsm').get('calculation.numerator').id, this.get('qsm').get('calculation.denominator').id];
        } else if (metric_type === 'Function') {
          this.set('error', true);
          sparams['qp_params']['y']['args'] = [this.get('qsm').get('calculation.mapper')];

        }

        sparams['percentile'] = false;
      }
    }
    return sparams;
  },

  getChartData: function () {
    //reset ui components that should have not state:
    this.set('search_string', null);
    this.set('search_series_loading', false);
    this.set('search_series', null);
    this.set('series_display', null);
    if (this.get('model.dashboard')) {
      this.set('type_date_dimensions_selected', this.get('type_date_dimensions').findBy('dimid', this.get('sd')));
    }

    Ember.run.once(this, ()=> {
      const sparams = this.prepare_params();

      if (!sparams) {
        return;
      }

      this.set('loading', true);
      this.set('series', null);
      this.get('chartService').getChart(sparams).then((data)=> {
        if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
          let seriesDisplay;
          if (this.get('series_display')) {
            seriesDisplay = this.get('series_display').split('&&&');
          } else {
            seriesDisplay = [];
          }

          data.new_series = data.new_series.map((serie, idx)=> {
            serie.data = serie.data.map((data)=> {
              data.x = new Date(data.name).getTime();
              return data;
            });
            if (this.get('series_display')) {
              serie.should_display = seriesDisplay.indexOf(serie.name) !== -1;
            } else if (idx < 5) {
              serie.should_display = true;
              seriesDisplay.push(serie.name);
            } else {
              serie.should_display = false;
            }
            return serie;
          });
          this.set('loading', false);
          this.set('series', data.new_series);

          this.set('serverChart', data);
          this.set('error', false);
          this.set('series_display', seriesDisplay.join('&&&'));
          const p = this.getParams();
          this.transitionTo({queryParams: p});
        }
      }, (error) => {
        this.set('error', true);
        this.set('loading', false);
        console.log(error);
      });
    });
  },

  chartTypes: [{name: 'Time View', type: 'line', stack: null},
    {name: 'Bar', type: 'column', stack: 'null'},
    {name: 'Pie', type: 'pie', stack: 'null'},
    {name: 'Stacked', type: 'line', stack: 'normal'},
    {name: 'Percent', type: 'line', stack: 'percent'}],

  setSelectedChartType(type, stack) {
    this.set('selectedChartType', this.get('chartTypes').find(function (ct) {
      return ct.type === type && ct.stack === stack;
    }));
  },

  allmetrics: function () {
    let ms = this.get('model.metrics');
    let fs = this.get('model.funnels');
    let dash = this.get('model.dashboard');

    if (fs) {
      let allms = Ember.A([]);
      fs.forEach(function (f) {
        allms.pushObject(FunnelMetric.create({
          content: f,
          dashboard: dash
        }));
      });
      ms.forEach(function (m) {
        allms.pushObject(m);
      });
      return allms;
    }
    return ms;
  }.property('model.metrics', 'model.funnels'),
  type_date_dimensions: function () {
    const model = this.get('model');
    const date = model.dashboard.get('date');
    return [
      {
        name: "Daily",
        id: "Day by day",
        dimid: date,
        diff: null
      },
      {
        name: "Weekly",
        id: "Week by week",
        dimid: model.dashboard.get('week'),
        diff: null
      }];

    // {
    //   id: "Year over Year",
    //   name: "Year over Year",
    //   dimid: date,
    //   diff: {
    //     count: 364,
    //     period: "days"
    //   }
    // },
    // {
    //   id: "Month over Month",
    //   name: "Month over Month",
    //   dimid: date,
    //   diff: {
    //     count: 1,
    //     period: "months"
    //   }
    // },
    // {
    //   id: "Week over Week",
    //   name: "Week over Week",
    //   dimid: date,
    //   diff: {
    //     count: 1,
    //     period: "weeks"
    //   }
    // }
    // ];
  }.property('chartProperties'),
  type_date_dimensions_selected: null,
  groupByValuesOnly: true,
  qsdd: null,
  alltoprofile: true,
  sortChoices: [
    {name: 'Ascending'}, {name: 'Descending'}
  ],
  topNChoices: [
    {name: '20'}, {name: '100'}, {name: '1000'}
  ],
  yAxisName: function () {
    let sm = this.get('sm');
    if (!sm) {
      return null;
    }
    let qsm = this.get('allmetrics').findBy('id', sm);

    if (qsm) {
      return qsm.get('name');
    } else {
      return null;
    }
  }.property('sm'),
  disableDraw: function () {
    return !this.get('qsm');
  }.property('qsm'),
  setSort: function () {
    const qsd = this.get('qsd.id');
    const qsm = this.get('qsm');
    const dashdate = this.get('model.dashboard.date');

    if (qsm && dashdate !== qsd) {
      this.set('qsortm', qsm);
      this.set('qtopN', this.get('topNChoices')[0].name);
    } else {
      this.set('qsortm', null);
      this.set('qtopN', null);
    }
  }.observes('qsm', 'qsd'),
  selected_recommended_date_string: null,

  compareSettings: function () {
    const metrictype = this.get('qsm.calculation.type');
    const ratiotype = this.get('qsm.calculation.ratio_type');
    let defaultS = {
      fmt: 'metric',
      firstBarFmt: metrictype === 'Ratio' && ratiotype === 'Avg' ? 'metric' : 'percunit',
      secondBarFmt: metrictype === 'Ratio' && ratiotype === 'Avg' ? 'metric' : 'percunit',
      firstBarMsg: metrictype === 'Ratio' ? 'when user trigger this' : 'share when user trigger this',
      secondBarMsg: metrictype === 'Ratio' ? 'when users don\'t trigger this' : 'share when users don\'t trigger this',
      resultTitle: this.get('qsm.name'),
      segmentTitle: "Top Segments",
      sort: 'om',
      sort_asc: 'om_asc',
      sort_desc: 'om_desc',
      showIcon: true,
      showImpactButton: true,
      showSignificantCheckbox: true,
      firstBarVal: metrictype === 'Ratio' ? 'om' : 'pct',
      secondBarVal: metrictype === 'Ratio' ? 'om' : 'pct',
      alwaysShowSecondBar: false,
      showVal: 'om',
      showValFrom: 'b',
      colorWith: metrictype === 'Ratio' ? 'pm' : null,
      showDriverSelect: false,
      showGroups: false,
      showSessionList: false,
      showConversionChart: false,
      showSizeChart: false,
      sizeColName: "% of Users",
      totalUsers: "of all users triggered this",
      unit: this.get('qsm.unit_type'),
      showMoreInline: true,
      toggleSignificantInline: true,
      showSizeColumn: metrictype === 'Ratio'
    };
    return defaultS;
  }.property('qsm'),
  recommended_date_string_selection_changed: function () {
    let selected_string = this.get('selected_recommended_date_string').name;
    if (selected_string === 'rest') {
      this.set('bpt', this.get('apt'));
      this.set('apt', {'name': 'rest', 'value': 'rest', pts: []});
      this.set('selected_recommended_date_string', null);
    } else if (selected_string === 'usual') {
      let apt = this.get('apt');
      let days_before = null;
      let days_1_ago = null;
      if (apt.name) {
        days_before = moment(apt.name).subtract(28, 'days').format('YYYY-MM-DD');
        days_1_ago = moment(apt.name).subtract(1, 'days').format('YYYY-MM-DD');
      }
      this.set('pointb', [{op: '==', 'value': this.get('apt').name}]);
      this.set('pointa', [{op: '<=', 'value': days_1_ago}, {op: '>=', 'value': days_before}]);
      this.set('selected_recommended_date_string', null);
    }
  }.observes('selected_recommended_date_string'),

  loadingDimensions: false,
  mysortm: function () {
    let sortm = this.get('sortm');
    let sd = this.get('sd');
    let d = this.get('model.dashboard.date');

    if (sd === d) {
      return null;
    } else if (!sortm) {
      return this.get('sm');
    }
    return sortm;
  }.property('sd', 'sortm', 'model.dashboard.date', 'sm'),
  mytopN: function () {
    let topN = this.get('topn');
    let sd = this.get('sd');
    let d = this.get('model.dashboard.date');

    if (sd === d) {
      return null;
    } else if (!topN) {
      return 20;
    }
    return topN;
  }.property('sd', 'topN', 'model.dashboard.date'),
  actions: {
    toggle_serie: function (serie) {
      let seriesDisplay = this.get('series_display').split('&&&');
      if (serie.should_display) {
        Ember.set(serie, 'should_display', false);
        seriesDisplay = seriesDisplay.filter(e => e !== serie.name);
      } else {
        Ember.set(serie, 'should_display', true);
        seriesDisplay.push(serie.name);
      }
      const p = this.getParams();
      p.series_display = seriesDisplay.join('&&&');
      this.transitionTo({queryParams: p});
    },
    add_serie: function (serie) {
      const series = this.get('series');
      const currentSeries = series.map((x)=>x.name);
      if (currentSeries.indexOf(serie.name) === -1) {
        series.pushObject(serie);
      }
      this.set('search_series', null);
      this.send('toggle_serie', serie);
    },
    search: function () {

      let sparams = this.prepare_params();

      if (!sparams) {
        return;
      }
      this.set('search_series_loading', true);
      this.get('chartService').getChart(sparams).then((data)=> {
        data.new_series = data.new_series.map((serie, idx)=> {
          serie.data = serie.data.map((data)=> {
            data.x = new Date(data.name).getTime();
            return data;
          });
          return serie;
        });
        this.set('search_series_loading', false);
        this.set('search_series', data.new_series);
      });

    }
  }
});

