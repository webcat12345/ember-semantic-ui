import Ember from 'ember';
import WhyController from '../mixin';
import ENV from "../../application/controller";
import {compileFilters} from 'datasenseui/utils/filter-utils';

export default Ember.Controller.extend(WhyController, {
  targetRoute: 'apps.funnel',
  type: 'funnel',

  dimensionsValues: [],

  selectedFunnelType: 'metric',
  selectedStartMetric: null,
  selectedEndMetric: null,
  selectedStartEvent: null,
  selectedEndEvent: null,
  selectedCountMetric: null,
  funnelTypes: [
    {
      id: 'metric',
      'name': 'Conversion Metric'
    },
    {
      id: 'events',
      'name': 'Start and End Events'
    }],

  displaySettings: function () {
    const rd = this.get('resultDimension');
    let defaultS = {
      fmt: 'percunit',
      firstBarFmt: 'percunit',
      secondBarFmt: 'percunit',
      firstBarMsg: 'when user trigger this',
      secondBarMsg: 'when users don\'t trigger this',
      resultTitle: "Conversion",
      segmentTitle: "Top Actions",
      sort: 'om',
      sort_asc: 'om_asc',
      sort_desc: 'om_desc',
      showIcon: true,
      showImpactButton: true,
      showSignificantCheckbox: true,
      firstBarVal: 'om',
      secondBarVal: 'om',
      alwaysShowSecondBar: false,
      showVal: 'om',
      showValFrom: 'b',
      colorWith: 'pm',
      showDriverSelect: true,
      showGroups: false,
      showSessionList: false,
      showConversionChart: false,
      showSizeChart: false,
      sizeChartName: "User count by ",
      metricChartName: "Conversion rate by ",
      numeratorSeriesName: "Converted Users",
      denominatorSeriesName: "All Users",
      metricSeriesName: "Conversion rate",
      regressionLineName: "Conversion trend",
      sizeYAxis: "User count",
      metricYAxis: "Conversion rate",
      sizeColName: "% of Users",
      totalUsers: "of all users triggered this",
      showSizeColumn: true
    };
    if (rd) {
      const rdname = rd.get('name');
      defaultS.sizeChartName += rdname;
      defaultS.metricChartName += rdname;
    }
    if (this.get('model.configuration.settings_ResultDim_id')) {
      defaultS.showDriverSelect = false;
    }
    if (this.get('model.datasets.connector_id') === 'ga' || this.get('mtype') !== 'metric') {
      defaultS.showSessionList = false;
    }
    return defaultS;
  }.property('resultDimension', 'B'),
  funnelMetrics: Ember.computed.filter('model.metrics', function (metric) {
    let g = metric.get('group');
    return g && g.indexOf('funnel') > -1;
  }),
  conversionMetrics: function () {
    let ms = this.get('model.metrics');
    let newms = Ember.A([]);
    let prerun_ms = Ember.A([]);

    ms.forEach(function (m) {
      if (m.get('calculation.type') === 'Ratio') {
        newms.pushObject(m);
        if (m.get('group') && m.get('group').indexOf('prerun') >= 0) {
          prerun_ms.pushObject(m);
        }
      }
    });
    if (prerun_ms.length > 0) {
      return prerun_ms;
    } else {
      return newms;
    }
  }.property('model.metrics'),

  readyToAnalyze: function () {
    let t = this.get('selectedFunnelType');
    if (!this.get('queryDimension') && !this.get('resultDimension')) {
      return false;
    }
    if (t === 'metric' && !this.get('selectedMetric')) {
      return false;
    } else if (t === 'events' && (!this.get('selectedStartEvent') || !this.get('selectedEndEvent') || !this.get('selectedCountMetric'))) {
      return false;
    } else if (t === 'twometrics' && (!this.get('selectedStartMetric') || !this.get('selectedEndMetric'))) {
      return false;
    }
    return true;
  }.property('selectedFunnelType', 'selectedMetric', 'selectedStartMetric', 'selectedEndMetric',
    'selectedStartEvent', 'selectedEndEvent', 'selectedCountMetric', 'queryDimension', 'resultDimension'),
  chart: function () {
    var pts = this.get('pts');
    let chart = [{name: "Winners", color: "green", data: pts.filterBy('isWinner', true)},
      {name: "Losers", color: "red", data: pts.filterBy('isWinner', false)}];
    return chart;
  }.property('pts'),

  getDimensionsValues: function () {
    const t = this.get('type');
    if (t === 'change') {
      return;
    }
    let selectedDimension = this.get('queryDimension.id');
    if (selectedDimension) {
      Ember.$.get(ENV.api_endpoint + '/schema/dimensionsValues/' + selectedDimension + '/')
        .then((dimensionsValues)=> {
          let localDimensionsValues = dimensionsValues.map((dim)=> {
            return {name: dim, value: encodeURI(dim)};
          });
          this.set('dimensionsValues', localDimensionsValues);
        });
    } else {
      this.set('dimensionsValues', null);
    }
  },
  fetchDimensionValues: function () {
    Ember.run.once(this, 'getDimensionValues');
  }.observes('queryDimension'),

  actions: {
    analyze: function () {
      this.clickAnalyze();
      let p = this.getParams();
      p.mtype = this.get('selectedFunnelType');
      p.metric_id = this.get('selectedMetric.id');
      p.factor_id = this.get('queryDimension.id');

      if (p.mtype === 'events') {
        const sevent = this.get('selectedStartEvent');
        const eevent = this.get('selectedEndEvent');
        if (sevent && eevent) {
          p.num_id = p.factor_id + '@@' + sevent + ',*,' + eevent;
          p.denom_id = p.factor_id + '@@' + sevent + ',*';
        } else {
          p.num_id = null;
          p.denom_id = null;
        }
        p.metric_id = this.get('selectedCountMetric.id');
      } else if (p.mtype === 'twometrics') {
        p.denom_id = this.get('selectedStartMetric.id');
        p.num_id = this.get('selectedEndMetric.id');
      }
      p.dim = this.get('resultDimension.id');

      if (!p.dim) {
        p.dim = p.factor_id;
      } else if (!p.factor_id) {
        p.factor_id = p.dim;
      }

      p.fltr = compileFilters(this.get('filters'));
      if (!p.sd) {
        p.sd = this.get('startDate');
      }
      if (!p.ed) {
        p.ed = this.get('endDate');
      }
      p.sort = "b.pct";
      p.sort_dir = 'desc';
      p.search_str = null;
      p.a = "funnel";
      p.make_raw_slices = true;
      p.b = p.factor_id + "==None";

      this.transitionToRoute('apps.funnel', {
        queryParams: p
      });
    }
  }
});

