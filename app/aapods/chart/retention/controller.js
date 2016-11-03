import Ember from 'ember';
import ChartController from '../mixin';

export default Ember.Controller.extend(ChartController, {
  chartService: Ember.inject.service('chart'),
  chart_type: "retention",
  default_val_ct: 0,
  groupByValuesOnly: true,
  showCt: 10,
  showMore: false,
  selected_time_window: null,
  qp_params: {
    period_limit: 60
  },
  showPercentage: false,
  cohortTable: null,
  sort_period: 0,
  sort_by_count: true,
  sort_reverse: true,
  loadingCohorts: null,
  week0Filter: function () {
    let sd = this.get('sd');
    let f = this.get('f');
    if (!sd) {
      return f;
    }

    if (!f) {
      f = '';
    } else {
      f += ';';
    }
    f += sd + '==0';
    return f;
  }.property('f'),
  xaxis: function () {
    let available_windows = [];

    const dash = this.get('model.dashboard');
    const days = dash.get('session_table.days_since_start');
    if (days) {
      available_windows.push({
        id: days,
        name: "Daily",
        axisName: "Day"
      });
    }
    const weeks = dash.get('session_table.weeks_since_start');
    if (weeks) {
      available_windows.push({
        id: weeks,
        name: "Weekly",
        axisName: "Week"
      });
    }
    const months = dash.get('session_table.months_since_start');
    if (months) {
      available_windows.push({
        id: months,
        name: "Monthly",
        axisName: "Month"
      });
    }
    return available_windows;
  }.property('model.dashboard'),

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
  addDefaultCohort: function (params) {
    const dash = this.get('model.dashboard');
    if (params.dimension_id === dash.get('session_table.days_since_start')) {
      params._segments.dim_id = dash.get('user_table.start_date');
    }
    if (params.dimension_id === dash.get('session_table.weeks_since_start')) {
      params._segments.dim_id = dash.get('user_table.start_week');
    }
    if (params.dimension_id === dash.get('session_table.months_since_start')) {
      params._segments.dim_id = dash.get('user_table.start_month');
    }
  },

  isDateCohort: function (dimid) {
    const dash = this.get('model.dashboard');
    return (dimid === dash.get('user_table.start_date') ||
    dimid === dash.get('user_table.start_week') ||
    dimid === dash.get('user_table.start_month'));

  },
  updatedCohorts: function () {
    let cparams = this.get('cohortParams');
    let ct = this.get('cohortTable');
    if (!ct || !ct.new_series) {
      return;
    }
    let userid = this.get('model.dashboard.user_table.id_col');
    if (!userid) {
      return;
    }
    let showCt = this.get('showCt');
    let sd = cparams.dimension_id;
    let gid = cparams._segments.dim_id;

    let f = this.get('f');
    if (!f) {
      f = '';
    } else {
      f += ';';
    }
    let dash = this.get('model.dashboard');

    let new_series = ct.new_series;
    new_series.forEach(function (series, index) {
      if (series && series.data) {
        if (index >= showCt) {
          series.showMore = false;
        } else {
          series.showMore = true;
        }

        series.data.forEach(function (period) {
          period.bgcolor = Ember.String.htmlSafe('background: rgba(75, 0, 130, ' + (period.y / 100).toFixed(2) + ');');
          period.profileFilter = f + gid + '==' + series.name + ";" + sd + '==0';
          // period.profileB = 'INDIRECT(' + userid + '|' + sd + '>=' + period.name + ')';
          period.profileB = '' + sd + '>=' + period.name + '';
        });
      }
    });
    return new_series;
  }.property('cohortTable'),

  cohortParams: function () {
    let qsd = this.get('qsd');
    let period = 6;
    if (qsd && qsd.name === 'Weekly') {
      period = 12;
    } else if (qsd && qsd.name === 'Daily') {
      period = 14;
    }
    let params = {
      "dataset_id": this.get('model.dataset_id'),
      "metric_id": this.get('sm'),
      "dimension_id": this.get('sd'),
      "_segments": {"dim_id": this.get('group_by_id'), "_limit": 20},
      "start_date": this.get('startDate'),
      "end_date": this.get('endDate'),
      "topN": 100,
      "filter": this.get('f'),
      "spark_only": true,
      "percentile": true,
      "show_nulls": false,
      "query_id": "weekly_retention",
      "qp_params": {
        "sort_period": this.get('sort_period'),
        "sort_by_count": this.get('sort_by_count'),
        "sort_reverse": this.get('sort_reverse'),
        "period_limit": period
      }
    };
    if (!params._segments.dim_id) {
      this.addDefaultCohort(params);
    }
    if (params._segments.dim_id && this.isDateCohort(params._segments.dim_id)) {
      params.qp_params.sort_period = -1;
      params.qp_params.sort_reverse = false;
      delete params.qp_params.sort_by_count;
    }
    return params;
  }.property('sd', 'group_by_id', 'startDate', 'endDate', 'f', 'sort_period', 'sort_by_count', 'sort_reverse'),
  fetchCohorts: function () {
    let params = this.get('cohortParams');
    let _this = this;
    if (!params.dimension_id || !params._segments.dim_id || !params.start_date || !params.end_date) {
      _this.set('cohortTable', null);
      _this.set('loadingCohorts', false);
      return;
    }
    this.set('loadingCohorts', true);
    this.get('chartService').getChart(params).then(
      function (cohorts) {
        _this.set('cohortTable', cohorts);
        _this.set('loadingCohorts', false);
      },
      function (error) {
        console.error(error);
      }
    );
  },
  runFetchCohorts: function () {
    Ember.run.once(this, 'fetchCohorts');
  }.observes('cohortParams').on('init'),
  actions: {
    showPercentage: function (show) {
      this.set('showPercentage', show);
    },
    showMore: function (show) {
      this.set('showMore', show);
    },
    setPoint: function (type, value) {
      // value is a a point contains {name, value, pts}
      let retvalue = null;
      if (value && value.value) {
        let qsd = this.get('qsd');
        let week = value.pts[0].name;
        let series = value.pts[0].seriesName;
        let gid = this.get('group_by_id');
        let f = null;
        let userid = this.get('model.dashboard.user_table.id_col');
        if (!userid) {
          return;
        }
        let name = qsd.axisName + ">=" + week;
        if (series && series !== 'Overall') {
          name = series + ", " + name;
        }
        this.set('apt', {
          name: "Users who did not retain",
          value: 'rest'
        });
        this.set('bpt', {
          name: name,
          pts: value.pts,
          filter: this.get('week0Filter'),
          value: qsd.id + '>=' + week
        });
      } else {
        this.set('bpt', null);
      }
    }
  }
});

