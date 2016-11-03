import Ember from 'ember';
import WhyController from '../mixin';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend(WhyController, {
  targetRoute: 'apps.feature',
  type: 'mevsrest',
  dims_results: [],
  dimension_list: [],
  query_A: null,
  query_B: null,
  displaySettings: function () {
    let s = {
      fmt: 'changepercunit',
      firstBarFmt: 'percunit',
      secondBarFmt: 'percunit',
      firstBarMsg: '',
      secondBarMsg: '',
      firstSegmentMessage: 'Segment A',
      secondSegmentMessage: 'Segment B',
      firstSegmentColor: '',
      secondSegmentColor: '',
      resultTitle: "Difference ",
      showIcon: false,
      boldtitle: true,
      sort: 'diff_perc_count',
      sort_asc: 'diff_perc_count_asc',
      sort_desc: 'diff_perc_count_desc',
      firstBarVal: 'pct',
      alwaysShowSecondBar: true,
      secondBarVal: 'pct',
      showImpactButton: false,
      showSignificantCheckbox: true,
      showVal: 'diff_perc_count',
      showValFrom: 'facet',
      colorWith: 'diff_perc_count',
      showGroups: true,
      maxBarSize: 100,
      totalUsers: "of all sessions have this attribute",
      showDriverSelect: true,
      showSessionList: false,
      showConversionChart: false,
      showSizeChart: false,
      sizeChartName: "No of sessions by ",
      metricChartName: "Probability for ",
      numeratorSeriesName: " ",
      denominatorSeriesName: " ",
      regressionLineName: "Probability trend",
      metricSeriesName: "Probability",
      sizeYAxis: "No of Sessions",
      sizeColName: "% of Sessions",
      metricYAxis: "Probability",
      showSizeColumn: false,
      showMoreInline: true
    };
    s.segmentTitle = this.get('resultDimension.name');
    if (!this.get('A')) {
      s.secondSegmentMessage = "Other users";
    }
    let B = this.get('B');
    if (B && B.length > 20) {
      B = B.substr(0, 20);
      B += "...";
    }
    return s;
  }.property('resultDimension', 'B', 'A'),

  dimensionList: function () {
    const sg = this.get('selectedGroup');
    const display = this.get('displaySettings');
    if (!sg) {
      return null;
    }
    this.set('dims_results', []);
    const dimlist = [];

    sg.metrics.forEach(function (d) {
      let mydisplay = $.extend({}, display);
      mydisplay.showSignificantCheckbox = false;
      mydisplay.segmentTitle = d.text;
      if (!dimlist.findBy('id', d.id)) {
        dimlist.push({
          id: d.id,
          name: d.text,
          displaySettings: mydisplay,
          data: null
        });
      }
    });

    this.set('dimension_list', dimlist.slice(0, 20));
  }.observes('selectedGroup'),

  _sort_dimensions: function (dim_results) {
    //todo : API will always return factors in the future.
    // but for now it might be empty, so we need to filters some

    const dimList = this.get('dimension_list');
    const display = this.get('displaySettings');
    //filter empty facets
    const filteredVersion = dim_results.filter((x)=> x.factors && x.factors.length !== 0 && x.facets.length !== 0);
    //only get dims id and score used ("diff")
    const simplifyVersion = filteredVersion.map((x)=> {
      let score = -100;
      if (x.facets[0].isSignificant) {
        score = Math.abs(this.getShownValue(x.facets[0], display));
      }
      return {
        dim_id: x.factors[0].id,
        score: score
      };

    });
    //get correct order and only dim_id
    const sortedResults = simplifyVersion.sortBy('score').reverse();
    const sortedId = sortedResults.map((x)=> x.dim_id);
    const dimListSorted = dimList.sort((a, b)=> {
      const aIdx = sortedId.indexOf(a.id) === -1 ? 10000 : sortedId.indexOf(a.id);
      const bIdx = sortedId.indexOf(b.id) === -1 ? 10000 : sortedId.indexOf(b.id);
      return aIdx - bIdx;
    });
    const dimListEnrich = dimListSorted.map((x, i)=> {
      Ember.set(x, 'order', i);
      return x;
    });
    this.set('dimension_list', Ember.A(dimListEnrich));
  },
  isLoading: function () {
    return this.get('loading') < 100;
  }.property('loading'),
  loading: function () {
    const done = this.get('dims_results').length;
    const total = this.get('dimension_list').length;
    return done / total * 100;
  }.property('dims_results', 'dimension_list'),
  actions: {
    analyze: function () {
      const p = this.getParams();
      p.metric_id = this.get('model.dashboard.session_table.countmetric');
      p.factor_id = this.get('queryDimension.id');
      p.dim = this.get('resultDimension.id');
      p.group = this.get('selectedGroup.name');
      p.fltr = this.get('filters_query');

      p.a = this.get('query_a');
      p.b = this.get('query_b');

      //todo this is a hack. We don't actualy use factor_id but it is required for the back-end to work
      if (p.b) {
        this.set('factor_id', p.b.substring(0, 24));
        this.set('dim', p.b.substring(0, 24));
      }
      if (!p.sd) {
        p.sd = this.get('startDate');
      }
      if (!p.ed) {
        p.ed = this.get('endDate');
      }

      this.set('model.params.a', this.get('a'));
      this.set('model.params.b', this.get('b'));


      this.set('model.params', p);
      this.set('model.params.factor_id', p.b.substring(0, 24));
      this.set('model.params.dim', p.b.substring(0, 24));

      this.set('dimension_list', Ember.A(this.get('dimension_list')));

      this.transitionToRoute('apps.feature', {
        queryParams: p
      });

    },
    setResults: function (results) {
      const dim_results = this.get('dims_results');
      dim_results.push(results);
      this._sort_dimensions(dim_results);
    }
  }
});

