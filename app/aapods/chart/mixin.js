import Ember from 'ember';
import ENV from 'datasenseui/config/environment';
import {parseFilters, compileFilters} from 'datasenseui/utils/filter-utils';

export default Ember.Mixin.create({
  needs: ["application"],
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
  showModal: 'controllers.application.showModal',

  queryParams: ['sm', 'sd', 'num_id', 'denom_id', 'startDate', 'endDate',
    'type', 'sortm', 'sortd', 'topN', 'f', 'chart_name', 'group_by_id', 'grpvals',
    'baseline', 'variation', 'show', 'stacking', 'timecomp', 'series_display'],

  group_by_id: null,
  grpvals: null,
  f: null,
  sm: null,
  sd: null,
  num_id: null,
  denom_id: null,
  startDate: null,
  endDate: null,
  sortm: null,
  sortd: null,
  type: null,
  topN: null,
  chart_name: null,
  baseline: null,
  variation: null,
  show: null,
  stacking: null,
  timecomp: null,
  series_display: null,

  filters_query:null,


  compareObject: null,
  group_by_object: null,
  group_by_values: null,
  default_val_ct: 1,

  qsm: null,
  qsd: null,
  apt: null,
  bpt: null,
  qtype: null,
  qtopN: null,
  qsortm: null,
  qsortd: null,
  qgrpvals: null,
  selectedChartType: null,
  qstacking: null,
  filters: [],
  alltoprilfe: null,
  compareEnabled: false,


  initialize: function (params) {
    this.set('qsortd', 'Descending');
    if (params.sm) {
      this.set('qsm', this.get('model.metrics').findBy('id', params.sm));
    }

    if (params.sd) {
      this.set('qsd', this.get('model.dimensions').findBy('id', params.sd));
    }
    if (params.sortm) {
      this.set('qsortm', this.get('model.metrics').findBy('id', params.sortm));
    }
    if (params.sortd) {
      this.set('qsortd', params.sortd);
    }
    if (params.topN) {
      this.set('qtopN', params.topN);
    }
    if (params.type) {
      this.set('qtype', params.type);
    }
    if (params.stacking) {
      this.set('qstacking', params.stacking);
    }
    //
    // if (params.sd) {
    //   const typeDate = this.get('type_date_dimensions').findBy('dimid', params.sd);
    //   if (typeDate) {
    //     this.set('type_date_dimensions_selected', typeDate);
    //   }
    // }

    if (params.group_by_id) {
      this.set('group_by_object', this.get('model.dimensions').findBy('id', params.group_by_id));
      if (params.grpvals) {
        this.set('qgrpvals', params.grpvals.split(',,,'));
      }
      this.set('compareEnabled', true);
    } else {
      this.set('grpvals', null);
      this.set('qgrpvals', null);
      this.set('compareEnabled', false);
    }

    this.set('qstartDate', null);
    this.set('qendDate', null);
    if (this.get('endDate')) {
      this.set('qendDate', this.get('endDate'));
    }
    if (this.get('startDate')) {
      this.set('qstartDate', this.get('startDate'));
    }
    if (!this.get('qendDate')) {
      this.set('qendDate', this.get('model.window.endDate'));
    }
    if (!this.get('qstartDate')) {
      this.set('qstartDate', moment(this.get('qendDate')).subtract(2, 'week').format('YYYY-MM-DD'));
    }

    this.set('filters_query', params.f);
  },

  reset: function () {
    this.queryParams.forEach((param)=> {
      this.set(param, null);
    });

    this.set('qsm', null);
    this.set('qsd', null);
    this.set('apt', null);
    this.set('bpt', null);
    this.set('qtype', null);
    this.set('qtopN', null);
    this.set('qsortm', null);
    this.set('qsortd', null);
    this.set('qgrpvals', null);
    this.set('qstacking', null);
    this.set('group_by_object', null);
    this.set('group_by_values', null);
    this.set('selectedChartType', null);
    this.set('pointa', null);
    this.set('pointb', null);
    this.set('compareEnabled', false);

    this.resetFilter();
  },

  disableDraw: function () {
    return !(this.get('qsm') && this.get('qsd'));
  }.property('qsm', 'qsd'),

  formCollapsed: function () {
    let show = this.get('show');
    if (show) {
      return "";
    } else {
      return "active";
    }
  }.property('show'),

  disableDims: Ember.computed.empty('dimensions'),
  generateName: function (filters_filtered) {
    let name = this.get('qsm.name');
    name += " by " + this.get('qsd.name');
    if (filters_filtered.length !== 0) {
      const filters_name = filters_filtered.map((filter)=> {
        return filter.values.map((filterValues)=> {
          return filter.dimsName + filter.filterType.replace('==', '=') + decodeURI(filterValues);
        }).join(' or ');
      }).join(' and ');

      if (filters_name && filters_name !== ' ') {
        name = name + " for " + filters_name;
      }
    }
    if (this.get('group_by_id')) {
      let gdim = this.get('model.dimensions').findBy('id', this.get('group_by_id'));
      if (gdim) {
        let gname = gdim.get('name');
        name += ' compared by ' + gname + ' ';
      }
    }
    return name;
  },

  resetFilter: function () {
    this.set('f', null);
    this.set("filters", []);
    this.set("filtersIds", [0]);
  },

  loadingGroupByValues: false,
  getGroupByValues: function () {
    let gid = this.get('group_by_id');
    if (gid) {
      this.set('loadingGroupByValues', true);
      Ember.$.get(ENV.api_endpoint + '/schema/values/' + gid + '/', {limit: 1000, sort_by_count: true})
        .then((dimensionsValues)=> {
          if (this.get('group_by_id') === gid) {
            this.set('loadingGroupByValues', false);
            if (dimensionsValues) {
              let default_val_ct = this.get('default_val_ct');
              if (default_val_ct > 0) {
                let selectedvals = dimensionsValues.splice(0, this.get('default_val_ct'));
                this.set('qgrpvals', selectedvals);
                this.set('grpvals', selectedvals.join(',,,'));
              }
              this.set('group_by_values', dimensionsValues.sort());
            } else {
              this.set('group_by_values', null);
              this.set('qgrpvals', null);
              this.set('grpvals', null);

            }
          }
        });
    } else {
      this.set('group_by_values', null);
    }
  },

  fetchGroupByValues: function () {
    Ember.run.once(this, 'getGroupByValues');
  }.observes('group_by_id'),

  getParams: function () {
    let params = {};
    this.get('queryParams').forEach((param)=> {
      params[param] = this.get(param);
    });
    return params;
  },

  driverModel: function () {
    let params = this.getParams();
    let query_params = this.get('query_params');

    let driverps = {
      fltr: params.f,
      metric_id: query_params ? query_params.m : null,
      sd: params.startDate,
      ed: params.endDate,
      statsig_only: true,
      sort: 'b.pct',
      sort_dir: 'desc',
      a: 'funnel',
      b: 'funnel',
      factor_id: params.group_by_id,
      dim: params.group_by_id,
      query_id: query_params ? query_params.query_id : null,
      qp_params: query_params ? query_params.qp_params : null
    };
    var m = {
      dataset: this.get('model.dataset'),
      dataset_id: this.get('model.dataset_id'),
      window: this.get('model.window'),
      metrics: this.get('model.metrics'),
      dashboard: this.get('model.dashboard'),
      dimensions: this.get('model.dimensions'),
      params: driverps
    };
    return m;
  }.property('f', 'sm', 'sd', 'startDate', 'endDate', 'group_by_id'),


  actions: {
    updateGroupByValues: function (values) {
      this.set('grpvals', values.join(",,,"));
      this.set('qgrpvals', values);
    },
    addGroupByValue: function (value) {
      let qgrpvals = this.get('qgrpvals');
      if (!qgrpvals) {
        qgrpvals = [];
      }
      qgrpvals.push(value);
      this.set('grpvals', qgrpvals.join(",,,"));
      this.set('qgrpvals', qgrpvals);
    },
    enableCompare: function (enable) {
      if (!enable) {
        this.set('group_by_object', null);
      }
      this.set('compareEnabled', enable);
    },
    compareBy: function () {
      let p = this.getParams();
      p.group_by_id = this.get('group_by_object.id');
      this.transitionTo({
        queryParams: p
      });
    },
    selectGroupBy: function (dimension, dimid) {
      this.set('series_display', null);
      this.set('group_by_object', dimension);
    },
    collapseFilters: function () {
      $('#hnav').toggle('400');
    },
    pinChart: function () {
      const chart = {};
      this.get('queryParams').forEach((param)=> {

        if (this.get(param) === 'undefined') {
          this.set(param, null);
        }
        if (param !== 'show') {
          chart[param] = this.get(param);
        }
      });
      chart['dataset_id'] = this.get('model.dashboard').get('id');
      this.send("showModal", "save_chart", {
        chart: chart,
        feeds: this.store.find('feed', {
          dataset_id: this.get('model.dashboard').get('id')
        })
      });
    },
    setPoint: function (type, value) {
      // value is a a point contains {name, value, pts}
      if (type === 'a') {
        if (this.get('bpt') != null && value && value['value'] === this.get('bpt')['value']) {
          this.set('bpt', null);
        }
        this.set('apt', value);
      }
      if (type === 'b') {
        if (this.get('apt') != null && value && value['value'] === this.get('apt')['value']) {
          this.set('apt', null);
        }
        this.set('bpt', value);
      }
    },
    resetPoint: function (pointString) {
      let mapping = {'apt': 'pointa', 'bpt': 'pointb'};
      this.set(mapping[pointString], null);
      this.set(pointString, null);
      if (pointString === 'bpt') {
        this.set('pointa', null);
        this.set('apt', null);
      }
    },

    setCompare: function (compare) {
      this.set('compareObject', compare);
    },
    draw: function () {
      if (this.get('disableDraw')) {
        return;
      }
      this.set('sm', this.get('qsm.id'));
      let qsdid = this.get('qsd.id');
      if (this.get('type_date_dimensions_selected')) {
        this.set('sd', this.get('type_date_dimensions_selected.dimid'));
      } else if (qsdid) {
        this.set('sd', qsdid);
      } else {
        this.set('sd', this.get('model.dashboard.date'));
      }

      this.set('startDate', this.get('qstartDate'));
      this.set('endDate', this.get('qendDate'));
      this.set('type', this.get('qtype'));
      this.set('stacking', this.get('qstacking'));
      this.set('sortd', this.get('qsortd'));
      this.set('sortm', this.get('qsortm.id'));
      this.set('topN', this.get('qtopN'));
      const gid = this.get('group_by_object.id');
      if (this.get('group_by_id') !== gid) {
        this.set('group_by_values', null);
        this.set('qgrpvals', null);
        this.set('grpvals', null);
        this.set('group_by_id', gid);
      }
      this.set('show', 'chart');
      $('.ui.accordion.styled').accordion('close', 0);

      this.set('f', this.get('filters_query'));

      //this will work but it is unique to one page. need to find a way of setting query params only for certain charting
      this.set('baseline', this.get('selectedBaseline'));
      this.set('variation', this.get('selectedVariation'));
      const queryParamstransition = {};
      this.queryParams.forEach((key)=> {
        queryParamstransition[key] = this.get(key);
      });
      this.transitionTo({queryParams: queryParamstransition});
    },
    switch_points: function (a, b) {
      this.set('apt', b);
      this.set('bpt', a);
    },
    comp: function (dataset_id, compareObject, a, b, bfilter) {
      let dashdate = this.get('model.dashboard.date');
      let route = 'compare.explain';
      if (dashdate && compareObject.dimensionId && dashdate !== compareObject.dimensionId) {
        route = 'apps.feature';
      }
      if (this.get('alltoprofile')) {
        route = 'apps.feature';
      }
      let why_type = null;
      if (this.get('chart_type') === 'retention') {
        why_type = 'retention';
      }
      let fltr = null;
      if (compareObject.filter) {
        fltr = compareObject.filter;
      }
      const metric_id = compareObject.metricId, factor_id = compareObject.dimensionId,
        sd = compareObject.startDate, ed = compareObject.endDate;

      if ('type' in this.qsm && this.qsm.type === 'Funnel') {
        const selected_funnel = this.get('model.funnels').findBy('id', this.qsm.get('id'));
        if (!fltr) {
          fltr = '';
        } else {
          fltr += ';';
        }
        const number_of_steps_in_funnel = selected_funnel.get('steps').length;
        fltr += selected_funnel.get('id') + '==' + number_of_steps_in_funnel;
      }
      if (bfilter) {
        if (!fltr) {
          fltr = '';
        } else {
          fltr += ';';
        }
        fltr += bfilter;
      }
      const transition = {
        queryParams: {
          'metric_id': metric_id,
          a: a,
          b: b,
          fltr: fltr,
          factor_id: factor_id,
          sd: sd,
          ed: ed,
          dim: null,
          group: "Profile",
          why_type: why_type
        }
      };
      if (compareObject.sort) {
        transition.queryParams['sort'] = compareObject.sort;
      }

      if (!this.transitionToRoute) {
        this.get('currentController').transitionToRoute(route, transition);
      } else {
        this.transitionToRoute(route, transition);
      }


    },
    exploreSessions: function () {
      const filters_filtered = this.get('filters').filter((x)=>x.values[0] !== "" && x.values.length !== 0);
      const dims_selected = this.get('dimensions').filter((x)=>x.dimsId !== "").map((x)=> x.dimsId);

      this.set('startDate', this.get('qstartDate'));
      this.set('endDate', this.get('qendDate'));
      var filter = compileFilters(filters_filtered);
      this.set("sessionModel", {
        start_date: this.get('startDate'),
        end_date: this.get('endDate'),
        filters: filter,
        dataset_id: this.get('model.dataset_id'),
        dimids: dims_selected
      });
    }
  }
});
