import Ember from 'ember';
import ENV from 'datasenseui/config/environment';
import ChartController from '../../chart/mixin';

export default Ember.Component.extend(ChartController, {
  tagName: 'nav',
  classNames: ['nav', 'in'],
  needs: ["application"],
  showModal: 'controllers.application.showModal',
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
  chart_state: null,
  chart_state_possible: ['start_compare', 'compare_started'],
  chart_compare: false,
  reset_point: null,
  f: null,
  sm: null,
  qsm: null,
  sd: null,
  qsd: null,
  startDate: null,
  qstartDate: null,
  sortm: null,
  qsortm: null,
  sortd: null,
  qsortd: 'Descending',
  endDate: null,
  qendDate: null,
  type: null,
  qtype: 'Column',
  topN: null,
  qtopN: null,

  sortChoices: ['Ascending', 'Descending'],
  chartTypes: ['Line', 'Area', 'Bar', 'Column', 'Spline', 'Scatter', 'Pie'],

  apt: null,
  bpt: null,

  dimensions: null,
  fetchDimensions: function () {
    var sm = this.get('qsm.id');
    var dataset_id = this.get('model.dataset.id');
    this.set('loadingDimensions', true);
    var _this = this;
    this.store.query('dimension', {dataset_id: dataset_id, cooccur: sm}).then(function (dims) {
      _this.set('dimensions', dims);
      _this.set('loadingDimensions', false);
    }, function (error) {
      console.log(error);
      _this.set('loadingDimensions', false);
    });
  },
  processFetchDimensions: function () {
    Ember.run.once(this, 'fetchDimensions');
  }.observes('qsm'),
  actions: {
    pinChart: function (chartid) {
      this.sendAction("pinChart", chartid);
    }
  }
});
