import Ember from 'ember';
import ENV from 'datasenseui/config/environment';
import WhyController from '../mixin';
import {compileFilters} from 'datasenseui/utils/filter-utils';

export default Ember.Controller.extend(WhyController, {
  targetRoute: 'apps.retention',
  type: "retention",

  retention_start_value: null,
  retention_end_value: null,
  retention_dimension_values: [],
  selected_time_window: null,

  time_window_values: function () {
    let available_windows = [];

    const dash = this.get('model.dashboard');
    const days = dash.get('session_table.days_since_start');
    if (days) {
      available_windows.push({
        id: days,
        name: "Day"
      });
    }
    const weeks = dash.get('session_table.weeks_since_start');
    if (weeks) {
      available_windows.push({
        id: weeks,
        name: "Week"
      });
    }
    const months = dash.get('session_table.months_since_start');
    if (months) {
      available_windows.push({
        id: months,
        name: "Month"
      });
    }
    return available_windows;
  }.property('model.dashboard'),

  profileMetric: function () {
    return this.get('selectedMetric');
  }.property('selectedMetric'),

  getSelectedDimensionValues: function () {
    let values_array = [];
    for (let i = 0; i < 50; i++) {
      values_array.push({name: i.toString()});
    }
    this.set('retention_dimension_values', values_array);
    // const query_dim = this.get('queryDimension');
    // if (!query_dim) {
    //   return this.set('retention_dimension_values', null);
    // }
    // const dim_id = query_dim.id;
    // if (dim_id) {
    //   Ember.$.get(ENV.api_endpoint + '/schema/dimensionsValues/' + dim_id + '/')
    //     .then((dimensionsValues)=> {
    //       dimensionsValues = dimensionsValues.map((dim)=> {
    //         return {name: dim, value: encodeURI(dim)};
    //       });
    //       this.set('retention_dimension_values', dimensionsValues);
    //     });
    // } else {
    //   this.set('retention_dimension_values', null);
    // }
  },
  fetchDimensionValues: function () {
    Ember.run.once(this, 'getSelectedDimensionValues');
  }.observes('selected_time_window'),


  readyToAnalyze: function () {
    return !(!this.get('selected_time_window') || !this.get('resultDimension') || !this.get('retention_start_value') || !this.get('retention_end_value'));
  }.property('retention_start_value', 'retention_end_value', 'selected_time_window', 'resultDimension'),


  displaySettings: function () {
    const rd = this.get('resultDimension');
    const rstart = this.get('retention_start_value');
    const rend = this.get('retention_end_value');

    let defaultS = {
      fmt: 'percunit',
      firstBarFmt: 'percunit',
      secondBarFmt: 'percunit',
      firstBarMsg: 'for users with this attribute',
      secondBarMsg: 'for users without this attribute',
      resultTitle: "Retention",
      segmentTitle: "Segment",
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
      sizeChartName: "No of users by ",
      metricChartName: "Retention rate by ",
      numeratorSeriesName: "Week ",
      denominatorSeriesName: "Week ",
      regressionLineName: "Retention trend",
      metricSeriesName: "Retention rate",
      sizeYAxis: "No of users",
      metricYAxis: "Retention rate",
      totalUsers: "of all users have this attribute",
      sizeColName: "% of Sessions",
      showSizeColumn: true
    };
    if (rd) {
      const rdname = rd.get('name');
      defaultS.sizeChartName += rdname;
      defaultS.metricChartName += rdname;
    }
    if (rend) {
      defaultS.numeratorSeriesName += rend;
    }
    if (rstart) {
      defaultS.numeratorSeriesName += rstart;
    }
    return defaultS;
  }.property('resultDimension', 'retention_start_value', 'retention_end_value'),

  actions: {
    analyze: function () {
      this.clickAnalyze();
      const p = this.getParams();
      const resultDimension = this.get('resultDimension.id');
      const factor_id = this.get('selected_time_window.id');
      p.type = "retention";
      p.metric_id = this.get('selectedMetric.id');
      p.factor_id = factor_id;
      p.metric_id = this.get('model.dashboard.user_table.countmetric');
      p.dim = resultDimension;

      p.fltr = compileFilters(this.get('filters'));
      if (!p.sd) {
        p.sd = this.get('startDate');
      }
      if (!p.ed) {
        p.ed = this.get('endDate');
      }
      p.sort = "b.pct";
      p.sort_dir = "desc";
      p.search_str = null;
      p.a = "funnel";
      p.make_raw_slices = true;
      p.b = resultDimension + "==None";
      p.mtype = 'retention';
      p.denom_id = this.get('retention_start_value');
      p.num_id = this.get('retention_end_value');
      this.transitionToRoute('apps.retention', {
        queryParams: p
      });
    }
  }
});

