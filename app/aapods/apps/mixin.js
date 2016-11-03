import Ember from 'ember';
import formatFilter from 'datasenseui/helpers/format-filter';
import ENV from 'datasenseui/config/environment';
import {_dims, _filter, _filter2, _metrics, _groups} from 'datasenseui/utils/why-utils';

function getSelectionText() {
  let text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type !== "Control") {
    text = document.selection.createRange().text;
  }
  return text;
}

export default Ember.Mixin.create({
  needs: ["application"],
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
  compare: Ember.inject.service('compare'),

  metricTypes: [
    {
      id: 'metric',
      'name': 'Conversion Metric'
    },
    {
      id: 'events',
      'name': 'Start and End Events'
    },
    {
      id: 'twometrics',
      'name': 'Start and End Metrics'
    }],

  sortBys: [
    {
      id: 'diff_perc_count_asc',
      sort: 'diff_perc_count',
      direction: 'asc',
      name: 'Low First',
      opposite: 'diff_perc_count_desc'
    },
    {
      id: 'diff_perc_count_desc',
      sort: 'diff_perc_count',
      direction: 'desc',
      name: 'Low First',
      opposite: 'diff_perc_count_asc'
    },
    {
      id: 'om_asc',
      sort: 'b.om',
      direction: 'asc',
      name: 'Low First',
      opposite: 'om_desc'
    }, {
      id: 'om_desc',
      sort: 'b.om',
      direction: 'desc',
      name: 'High First',
      opposite: 'om_asc'
    },
    {
      id: 'contribdiff_asc',
      sort: 'contribdiff',
      direction: 'asc',
      name: 'Low First',
      opposite: 'contribdiff_desc'
    }, {
      id: 'contribdiff_desc',
      sort: 'contribdiff',
      direction: 'desc',
      name: 'High First',
      opposite: 'contribdiff_asc'
    }, {
      id: 'contribdiff_abs',
      sort: 'contribdiff',
      direction: null,
      name: 'Biggest First',
      opposite: 'contribdiff_asc'
    },
    {
      id: 'pct_asc',
      sort: 'b.pct',
      direction: 'asc',
      name: 'Small First',
      opposite: 'pct_desc'
    }, {
      id: 'pct_desc',
      sort: 'b.pct',
      direction: 'desc',
      name: 'Big First',
      opposite: 'pct_asc'
    },
    {
      id: 'gain',
      sort: 'gain',
      direction: null,
      name: 'Users Impacted'
    }
  ],

  selectedSortBy: function () {
    const sb = this.get('sortBys');
    const s = this.get('sort');
    const sort_direction = this.get('sort_dir');

    return sb.find(function (item) {
      return item.sort === s && item.direction === sort_direction;
    });
  }.property('sortBys', 'sort', 'sort_dir'),


  selectedB: null,

  getValuesFromFilter: function (fil) {
    let parsed = this.parseFilters(fil);
    return parsed.map(function (filobj) {
      if (filobj.values) {
        return filobj.values[0];
      }
      return null;
    }).join(", ");
  },
  B: function () {
    const filter = formatFilter.compute([this.get('b'), this.get('model.dimensions')]).string;

    if (filter) {
      return filter.replace('<b>', '').replace('</b>', '');
    }
    return "";
  }.property('b'),

  A: function () {
    let a = this.get('a');
    if (a === 'rest') {
      return null;
    }
    return this.getValuesFromFilter(a);
  }.property('a'),

  showCt: 20,
  selectedMetric: null,
  queryDimension: null,
  resultDimension: null,
  selectedGroup: null,

  searchStr: null,
  filters: [],
  settings: false,
  showSearch: false,
  showMore: false,

  queryParams: ['mtype', 'fltr', 'metric_id', 'sd', 'ed', 'num_id', 'denom_id',
    'factor_id', 'dim', 'topN', 'sort', 'sort_dir', 'make_raw_slices', 'query_id', 'qp_params',
    'search_str', 'a', 'b', 'statsig_only', 'stat_sig_level', 'hist_level', 'validate',
    'result_tab', 'adhoc_task', 'deeper_adhoc', 'group', 'cache', 'uiversion', 'why_type'],

  fltr: null,
  cache: null,
  result_tab: null,
  make_raw_slices: null,
  metric_id: null,
  sd: null,
  ed: null,
  num_id: null,
  denom_id: null,
  query_id: null,
  qp_params: null,
  factor_id: null,
  dim: null,
  topN: null,
  sort: null,
  sort_dir: null,
  mtype: null,
  search_str: null,
  a: null,
  b: null,
  statsig_only: true,
  stat_sig_level: null,
  validate: null,
  adhoc_task: null,
  deeper_adhoc: null,
  group: null,
  hist_level: null,
  filters_query: null,
  why_type: null,

  show_statsig: true,

  reset: function () {
    this.queryParams.forEach((param)=> {
      this.set(param, null);
    });

    this.set('selectedB', null);
    this.set('selectedMetric', null);
    this.set('queryDimension', null);
    this.set('resultDimension', null);
    this.set('results', null);
    this.set('filters', []);
    this.set('searchStr', null);
    this.set('settings', false);
    this.set('showMore', false);
    this.set('showSearch', false);


    this.set('statsig_only', true);
    this.set('make_raw_slices', true);
  },
  initialize: function (params) {
    let model = this.get('model');
    if (params.topN) {
      this.set('topN', params.topN);
    } else {
      this.set('topN', 200);
    }

    if (params.metric_id) {
      this.set('selectedMetric', model.metrics.findBy('id', params.metric_id));
    }

    if (params.fltr) {
      this.set('filters', this.parseFilters(params.fltr));
    }

    if (params.why_type) {
      this.set('why_type', params.why_type);
    }

    if (params.factor_id) {
      this.set('queryDimension', model.dimensions.findBy('id', params.factor_id));
    }

    if (params.dim) {
      this.set('resultDimension', model.dimensions.findBy('id', params.dim));
    }
    if (params.make_raw_slices === 'false') {
      this.set('make_raw_slices', null);
    }

    if (params.sort) {
      this.set('sort', params.sort);
      this.set('sort_dir', params.sort_dir);
    }

    if (!params.statsig_only || params.statsig_only === 'null' || params.statsig_only === 'false') {
      this.set('statsig_only', null);
    } else {
      this.set('statsig_only', true);
    }
    if (params.search_str) {
      this.set('searchStr', params.search_str);
      this.set('showSearch', true);
    }
    if (params.group) {
      this.set('selectedGroup', this.get('dimGroups').findBy('name', params.group));
    }

    if (params.b) {
      this.set('b', params.b);
      this.set('selectedB', this.get('B'));
    }

    let groups = this.get('dimGroups');
    if (groups && !this.get('selectedGroup')) {
      this.set('selectedGroup', groups[0]);
    }
    if (!params.mtype) {
      params.mtype = 'metric';
      this.set('mtype', 'metric');
    }
    if (params.query_id) {
      this.set('query_id', params.query_id);
      this.set('qp_params', params.qp_params);
    }
  },
  dimGroups: function () {
    return _groups(this.get('model.dimensions'));
  }.property('model.dimensions'),

  getFilterForPoint: function (point) {
    let facet = point.get("facet");
    let f = facet.f + "==" + facet.n;
    let fltr = this.get('fltr');
    if (fltr && fltr.indexOf(f) >= 0) {
      return;
    }
    if (fltr) {
      fltr += ';' + f;
    } else {
      fltr = f;
    }
    return fltr;
  },
  stringJoinNonNull: function (givenArray, seperator) {
    let non_null_array = [];
    for (let i = 0; i < givenArray.length; i++) {
      if (givenArray[i]) {
        non_null_array.push(givenArray[i]);
      }
    }
    return non_null_array.join(seperator);
  },
  getFilterForEventPoint: function (point, converted) {
    let ft = this.get('type');
    let mt = this.get('mtype');
    let facet = point.get("facet");
    let f = facet.f + "==" + facet.n;
    let baseline = this.get('a');
    let variation = this.get('b');
    let num_id = this.get('num_id');
    let denom_id = this.get('denom_id');
    if (mt === 'events' && baseline === 'funnel' && num_id !== null) {
      // if (baseline == 'funnel' && num_id != null) {
      let fltr = this.get('fltr');
      let factor_id = this.get('factor_id');
      let seq_filter = null;
      if (converted) {
        seq_filter = facet.f + '@@' + [denom_id, facet.n, num_id].join(',');
      } else {
        seq_filter = facet.f + '@@' + [denom_id, facet.n].join(',');
      }
      return this.stringJoinNonNull([fltr, seq_filter], ';');
    } else if (mt === 'retention') {
      if (converted) {
        return num_id;
      } else {
        return denom_id;
      }
    } else {
      let fltr = this.getFilterForPoint(point);
      if (converted) {
        fltr += ';' + this.get('numeratorMetric.id') + 'IsNotNull;' + this.get('numeratorMetric.id') + '!=0';
      } else {
        fltr += ';' + this.get('numeratorMetric.id') + 'IsNull,,' + this.get('numeratorMetric.id') + '==0';
      }
      return fltr;
    }
  },

  parseFilters: function (fltr) {
    const f = fltr || '';
    const filters = [];
    f.split(';').forEach((filter, idx)=> {
      let filterObject = {
        dimsId: filter.substring(0, 24),
        filterType: filter.substring(24, 26),
        values: [],
        filter_id: idx
      };
      filter.split(',,').forEach((filterValue)=> {
        filterObject.values.push(filterValue.substring(26, filterValue.length));
      });
      filters.push(filterObject);
    });
    if (filters.length === 0) {
      filters.push({dimsId: '', filterType: '', values: [], filter_id: 0});
    }
    return filters;
  },
  showLoader: function () {
    const isLoadingParent = this.get('isLoadingParent');
    const loadingResults = this.get('loadingResults');
    if (isLoadingParent) {
      return false;
    } else {
      return !!loadingResults;
    }
  }.property('isLoadingParent', 'loadingResults'),
  getShownValue: function (facet, display) {
    let show = null;
    if (display.showValFrom === 'a') {
      show = facet.facet_data.a[display.showVal];
    } else if (display.showValFrom === 'b') {
      show = facet.facet_data.b[display.showVal];
    } else {
      show = facet[display.showVal];
    }
    return show;
  },
  pts: function () {
    let facets = this.get('results.facets');
    let display = this.get('displaySettings');
    if (!facets) {
      return [];
    }
    let pts = Ember.A([]);
    let maxValue = 0;

    for (let i = 0; i < facets.length; i++) {
      if (!this.get("showMore") && pts.length >= this.get('showCt')) {
        continue;
      }
      if (!this.get('show_statsig') && !facets[i].isSignificant) {
        continue;
      }
      let pt = Ember.Object.create({
        y: Number(facets[i].om.toFixed(2)),
        name: name,
        facet: facets[i],
        isNew: facets[i].z_score_delta_mult > 2,
        x: facets[i].facet_data.b.ct,
        isClicked: false,
        color: '#82ca9c',
        labelcolor: 'text-green',
        isWinner: true
      });

      if (display.showValFrom === 'a') {
        pt.show = pt.facet.facet_data.a[display.showVal];
      } else if (display.showValFrom === 'b') {
        pt.show = pt.facet.facet_data.b[display.showVal];
      } else {
        pt.show = pt.facet[display.showVal];
      }
      pt.show = this.getShownValue(pt.facet, display);
      pt.sortby = pt.show;
      pt.score = Math.abs(pt.show);
      if (!display.colorWith) {
        pt.color = null;
        pt.labelcolor = null;
        pt.isWinner = false;

      } else if (pt.facet[display.colorWith] < 0) {
        pt.color = '#f69679';
        pt.labelcolor = 'text-red';
        pt.isWinner = false;
      }
      maxValue = Math.max(maxValue, pt.facet.facet_data.a[display.firstBarVal], pt.facet.facet_data.b[display.secondBarVal]);
      pt.firstBarShow = pt.facet.facet_data.b[display.secondBarVal];
      pt.secondBarShow = pt.facet.facet_data.a[display.firstBarVal];
      pt.sizeWidth = ((Math.sqrt(pt.facet.facet_data.b.pct) * 24 / 10) + 6).toFixed(0);

      pts.push(pt);
    }
    if (display.maxBarSize) {
      maxValue = display.maxBarSize;
    }
    pts.forEach(function (pt) {
      pt.firstBarWidth = (pt.facet.facet_data.b[display.secondBarVal] * 100 / maxValue).toFixed(0);
      pt.secondBarWidth = (pt.facet.facet_data.a[display.firstBarVal] * 100 / maxValue).toFixed(0);
    });
    return pts;
  }.property('results.facets', 'showMore', 'show_statsig'),

  shouldShowMore: function () {
    const significantFacets = this.get('results.facets').filter((x)=> {
      return x.isSignificant;
    });
    return significantFacets.length > this.get('showCt');
  }.property('results.facets', 'showCt'),


  results: null,
  resultChart: null,
  loadingResults: false,
  loadingStory: function () {
    const r = this.get('results');
    const l = this.get('loadingResults');
    return !r && l;
  }.property('results', 'loadingResults'),

  resultsExist: function () {
    const r = this.get('resultDimension.data_type');
    if (r === 'number') {
      return this.get('resultChart');
    } else {
      return this.get('results');
    }
  }.property('resultDimension', 'results', 'resultChart'),

  fetchResults: function () {
    let sm = this.get('metric_id');
    let num_id = this.get('num_id');
    let denom_id = this.get('denom_id');
    let ft = this.get('type');
    let mt = this.get('mtype');
    let ed = this.get('factor_id');
    let why_type = this.get('why_type');

    let endDate = this.get('ed');
    let startDate = this.get('sd');
    if( !endDate ){
      endDate = this.get('model.window.endDate');
    }
    if( !startDate ){
      startDate = this.get('model.window.startDate');
    }

    let a = this.get('a');
    let b = this.get('b');
    let statsig = this.get('statsig_only');
    let dimid = this.get('dim');
    let resultd;
    if (!dimid) {
      resultd = this.get('model.dimensions').get('firstObject');
      dimid = resultd.get('id');
    } else {
      resultd = this.get('model.dimensions').findBy('id', dimid);
    }


    if (!statsig || statsig === 'false' || statsig === 'null') {
      statsig = null;
    }

    if (ft === 'change' || this.get('targetRoute') === "compare.explain") {
      return;
    }


    if (!dimid || !resultd || !ed || !startDate || !endDate) {
      this.set('formError', "All fields not filled");
      this.set('results', null);
      this.set('resultChart', null);
      return;
    }


    let params = {
      dataset_id: this.get('model.dataset_id'),
      metric_id: sm,
      factor_id: ed,
      filter: this.get('fltr'),
      dimension_id: dimid,
      start_date: startDate,
      end_date: endDate,
      a: a,
      b: b,
      query_id: this.get('query_id'),
      qp_params: this.get('qp_params'),
      topN: this.get('topN'),
      search_str: this.get('search_str'),
      adhoc_task: this.get('adhoc_task'),
      deeper_adhoc: this.get('deeper_adhoc'),
      validate: this.get('validate'),
      make_raw_slices: true,
      statsig_only: statsig,
      stat_sig_level: this.get('stat_sig_level'),
      hist_level: this.get('hist_level'),
      sortby: this.get('sort'),
      direction: this.get('sort_dir'),
      cache: this.get('cache'),
      auto_seg: false,
      why_type: why_type
    };
    if (mt === 'metric') {
      if (!sm) {
        this.set('formError', "Metric not specified");
        this.set('results', null);
        this.set('resultChart', null);
        return;
      }
    } else if (mt === 'twometrics' || mt === 'events') {
      if (!num_id || !denom_id) {
        this.set('formError', "Metric does not have numerator or denominator");
        this.set('results', null);
        this.set('resultChart', null);
        return;
      }

      params.num_id = num_id;
      params.den_id = denom_id;
    } else if (mt === 'retention') {

      params.qp_params = {};
      params.qp_params.time_window = this.get('factor_id');
      params.qp_params.start_index = this.get('denom_id');
      params.qp_params.end_index = this.get('num_id');
      params.qp_params.week_op = '=';
      params.query_id = 'dim_retention';
      params.den_id = null;
      params.num_id = null;
      if (!params.qp_params.time_window || !params.qp_params.start_index || !params.qp_params.end_index || !params.qp_params.week_op) {
        this.set('formError', "Retention fields not set");
        this.set('results', null);
        this.set('resultChart', null);
        return;
      }
    }

    if (ft === 'mevsrest') {
      var session_table = this.get('model.dashboard.session_table');
      if (session_table && session_table.countmetric) {
        params.metric_id = session_table.countmetric;
      }
      if (mt === 'retention') {
        if (params.filter !== '') {
          params.filter += ';';
        }
        params.filter += params.qp_params.time_window + '==' + params.qp_params.start_index;
        delete params.qp_params;
        delete params.query_id;
      } else if (mt === 'events') {
        return;
      }
      if (this.get('resultDimension.data_type') === 'number') {
        params.auto_seg = true;
      }
      if (!a || !b) {
        this.set('formError', "Incorrect A or B Point");
        this.set('results', null);
        this.set('resultChart', null);
        return;
      }
    } else if (ft === 'change') {
      if (!a || !b) {
        this.set('formError', "A or B point not specified");
        this.set('results', null);
        this.set('resultChart', null);
        return;
      }
      params.ui_url = window.location.protocol + "//" + window.location.host;
      params.make_raw_slices = this.get('make_raw_slices');
      if (params.dimension_id && params.a === 'rest') {
        params.make_raw_slices = true;
      }
      params.num_id = params.factor_id + '@@' + denom_id + ',*';
      params.den_id = params.factor_id + '@@' + denom_id + ',*,' + num_id;
      this.set('results', null);
      this.set('resultChart', null);
      return;
    } else if (ft !== 'funnel' && ft !== 'retention') {
      this.set('formError', "This query is not yet supported");
      this.set('results', null);
      this.set('resultChart', null);
      return;
    }

    if (resultd.get('data_type') === 'number' && (ft === 'funnel' || ft === 'retention')) {
      this.fetchCharts(params);
      this.fetchCompare(params, true);
    } else {
      this.fetchCompare(params, false);
    }
  },
  processFetchResults: function () {
    Ember.run.once(this, 'fetchResults');
  }.observes('metric_id', 'num_id', 'denom_id', 'a', 'b', 'dim',
    'factor_id', 'topN', 'sort', 'sort_dir', 'fltr', 'search_str', 'statsig_only').on('init'),

  fetchCompare: function (params, background) {
    this.set('loadingResults', true);
    this.get('compare').get_compare(params).then((model)=> {
      this.set('loadingResults', false);
      this.set('results', model);
    }, (error)=> {
      console.log("Error fetching why result in Funnel");
      console.log(error);
      console.log(this);
      this.set('results', null);
      if (!background) {
        this.set('resultError', error);
        this.set('loadingResults', false);
      }
    });

  },

  chartService: Ember.inject.service('chart'),
  fetchCharts: function (allparams) {
    let params = {
      dataset_id: allparams.dataset_id,
      metric_id: allparams.metric_id,
      filter: allparams.filter,
      dimension_id: allparams.dimension_id,
      start_date: allparams.start_date,
      end_date: allparams.end_date,
      num_id: allparams.num_id,
      denom_id: allparams.den_id,
      query_id: allparams.query_id,
      qp_params: allparams.qp_params,
      window: true,
      fit: true,
      spark_only: true,
      cache: allparams.cache
    };
    let self = this;
    let mt = this.get('mtype');

    self.set('loadingResults', true);
    this.get('chartService').getChart(params).then(function (model) {
      self.set('resultChart', model);
      self.set('loadingResults', false);
    }, function (error) {
      console.log("Error fetching chart result in Funnel");
      console.log(error);
      console.log(this);
      self.set('resultChart', null);
      self.set('resultError', error);
      self.set('loadingResults', false);
    });

  },
  sizeChart: function () {
    const rc = this.get('resultChart');
    const ds = this.get('displaySettings');
    if (!rc) {
      return null;
    }
    let chart = [
      {
        name: ds.denominatorSeriesName, data: rc.series.map(function (pt) {
        return {
          x: Number(pt.name),
          name: Number(pt.name),
          y: pt.dep_metrics.denominator,
          z: 1,
          formattedy: pt.dep_metrics.denominator.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        };
      })
      },
      {
        name: ds.numeratorSeriesName, data: rc.series.map(function (pt) {
        return {
          x: Number(pt.name),
          name: Number(pt.name),
          y: pt.dep_metrics.numerator,
          formattedy: pt.dep_metrics.numerator.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        };
      })
      }];
    return chart;
  }.property('resultChart'),
  metricChart: function () {
    const rc = this.get('resultChart');
    const ds = this.get('displaySettings');
    if (!rc) {
      return null;
    }
    let chart = [{
      name: ds.metricSeriesName, data: rc.series.map(function (pt) {
        return {
          x: Number(pt.name),
          name: Number(pt.name),
          y: pt.y,
          formattedy: pt.y.toFixed(2).toString() + "%"
        };
      })
    },
      {
        type: 'line',
        name: ds.regressionLineName,
        data: rc.fit.map(function (pt) {
          return {
            x: Number(pt.name),
            name: Number(pt.name),
            y: pt.y,
            formattedy: pt.y.toFixed(2).toString() + "%"
          };
        }),
        marker: {
          enabled: false
        },
        states: {
          hover: {
            lineWidth: 0
          }
        }
      }];
    return chart;
  }.property('resultChart'),
  clickAnalyze: function () {
    this.set('results', null);
  },
  getParams: function () {
    let params = {};
    this.get('queryParams').forEach((param)=> {
      params[param] = this.get(param);
    });
    return params;
  },


  numeratorMetric: function () {
    let type = this.get('mtype');
    let m = this.get('metric_id');
    let did = this.get('num_id');
    if (did && type === 'twometrics') {
      return this.get('model.metrics').findBy('id', did);
    } else if (m && type === 'metric') {
      let metric = this.get('model.metrics').findBy('id', m);
      return metric.get('calculation.numerator');
    } else if (did && type === 'events') {
      return {"name": did, id: "did"};
    }
    return null;
  }.property('metric_id', 'num_id', 'mtype'),

  denominatorMetric: function () {
    let type = this.get('mtype');
    let m = this.get('metric_id');
    let did = this.get('denom_id');
    if (did && type === 'twometrics') {
      return this.get('model.metrics').findBy('id', did);
    } else if (m && type === 'metric') {
      let metric = this.get('model.metrics').findBy('id', m);
      return metric.get('calculation.denominator');
    } else if (did && type === 'events') {
      return {"name": did, id: "did"};
    }
    return null;
  }.property('metric_id', 'denom_id', 'mtype'),

  downloadData: function () {
    let rd = this.get('resultDimension.data_type');
    let display = this.get('displaySettings');
    let data = null;
    if (rd === 'number') {
      const rc = this.get('resultChart');
      data = [["Value", display.denominatorSeriesName,
        display.numeratorSeriesName,
        display.metricSeriesName]];
      rc.series.forEach(function (pt) {
        data.push([pt.name, pt.dep_metrics.denominator, pt.dep_metrics.numerator, pt.y]);
      });

    } else {
      let pts = this.get('pts');
      let results = this.get('results');

      data = [["Segment", "Statistical Significance", display.denominatorSeriesName,
        display.numeratorSeriesName,
        display.metricSeriesName, "%age size",
        display.denominatorSeriesName + " without this attribute",
        display.numeratorSeriesName + " without this attribute",
        display.metricSeriesName + " without this attribute",
        display.metricSeriesName + " Overall",
        display.denominatorSeriesName + " Overall",
        display.numeratorSeriesName + " Overall"]];

      pts.forEach(function (pt) {
        data.push([pt.facet.n, pt.facet.significance.pvalue,
          pt.facet.facet_data.b.ct, pt.facet.facet_data.b.mct, pt.facet.facet_data.b.om, pt.facet.facet_data.b.pct,
          pt.facet.facet_data.a.ct, pt.facet.facet_data.a.mct, pt.facet.facet_data.a.om,
          results.bpt.om, results.bpt.ct, results.bpt.mct]);

      });
    }
    return data;

  }.property('results', 'pts', 'resultDimension.data_type', 'resultChart', 'displaySettings'),

  actions: {
    toggleSettings: function () {
      this.set("settings", !this.get("settings"));
    },
    saveSettings: function () {
      this.set("settings", !this.get("settings"));
    },
    showMore: function (show) {
      this.set('showMore', show);
    },
    showSearch: function (show) {
      this.set('showSearch', show);
    },
    toggleSignificant: function () {
      let s = this.get('statsig_only');
      let p = this.getParams();
      if (s) {
        p.statsig_only = null;
      } else {
        p.statsig_only = true;
      }
      this.transitionToRoute(this.get('targetRoute'), {
        queryParams: p
      });
    },
    clickFacet: function (pt) {
      const text = getSelectionText();
      if (!text) {
        pt.set('isClicked', !pt.get('isClicked'));
      }
    },
    setSort: function (id) {
      const ss = this.get('selectedSortBy');

      let sortid = id + "_desc";
      if (ss && ss.id.indexOf(id) === 0) {
        sortid = ss.opposite;
      }
      let s = this.get('sortBys').findBy('id', sortid);
      let p = this.getParams();
      p.sort = s.sort;
      p.sort_dir = s.direction;
      this.transitionToRoute(this.get('targetRoute'), {
        queryParams: p
      });
    },

    setSearch: function () {
      let p = this.getParams();
      p.search_str = this.get('searchStr');
      this.transitionToRoute(this.get('targetRoute'), {
        queryParams: p
      });
    },

    modalForConversion: function (pt) {
      const cparams = this.getParams();

      const chartobj = {
        dataset: this.get('model.dataset'),
        selectedMetricId: cparams.metric_id,
        selectedDimensionId: this.get('model.dashboard.date'),
        dashboard: this.get('model.dashboard'),
        f: this.getFilterForPoint(pt),
        modalTitle: "Metric Over Time",
        spark_only: true,
        type: 'line',
        startDate: this.get('model.window.startDate'),
        endDate: this.get('endDate')
      };
      this.send('showModal', 'simple-chart', chartobj);
    },

    modalForTraffic: function (pt) {
      const chartobj = {
        dataset: this.get('model.dataset'),
        selectedMetricId: this.get('denominatorMetric.id'),
        selectedDimensionId: this.get('model.dashboard.date'),
        dashboard: this.get('model.dashboard'),
        f: this.getFilterForPoint(pt),
        modalTitle: "Metric Over Time",
        spark_only: true,
        type: 'line',
        startDate: this.get('model.window.startDate'),
        endDate: this.get('endDate')
      };
      this.send('showModal', 'simple-chart', chartobj);
    },
    addFilter: function () {
      const filters_ids = this.get('filters').map((x)=>x.filter_id).sort();
      let id = 0;
      if (filters_ids.length !== 0) {
        id = filters_ids[filters_ids.length - 1] + 1;
      }
      this.get('filters').addObject({dimsId: '', filterType: '', values: [], filter_id: id});
    },
    removeFilter: function (id) {
      const filter = this.get('filters').findBy('filter_id', id);
      const filterObjectIdx = this.get('filters').indexOf(filter);
      if (filterObjectIdx !== -1) {
        this.get('filters').removeAt(filterObjectIdx);
      }
    },
    setFilters: function (old, newFilter) {
      let current = this.filters.findBy('filter_id', old.filter_id);
      for (let key in newFilter) {
        if (key !== 'filter_id') {
          current[key] = newFilter[key];
        }
      }
    },
    setCompareType: function (val) {
      const cparams = this.getParams();
      cparams.result_tab = val;
      delete cparams.sort;
      delete cparams.sort_dir;
      this.transitionToRoute(this.get('targetRoute'), {
          queryParams: cparams
        }
      );
    },
    download: function (component, type) {
      if (type === 'excel') {
        this.get('excel').export(this.get('downloadData'), 'sheet1', 'data.xlsx');
      } else if (type === 'csv') {
        this.get('csv').export(this.get('downloadData'), 'data.csv');
      }
    },

    updateSelectedValue: function (component, allValue) {
      this.set('selectedB', allValue);
    },

    selectDimension: function (dimension, dimid, settab) {
      let dim = dimension;
      let did = dimid;
      if (!dimension) {
        dim = null;
      }
      if (!dimid) {
        did = null;
      }
      if (dim && did !== dim.get('id')) {
        did = dim.get('id');
      }
      if (did === this.get('dim') && this.get('result_tab') === 'dimension') {
        return;
      }
      if (dim && this.get('resultDimension.id') !== dim.get('id')) {
        this.set('resultDimension', dim);
      }
      const p = this.getParams();
      p.dim = did;

      if (did !== this.get('dim')) {
        p.search_str = null;
      }
      if (settab) {
        p.result_tab = 'dimension';
      }
      p.sort = "diff_perc_count";

      this.transitionToRoute(this.get('targetRoute'), {
        queryParams: p
      });

    }
  }
});
