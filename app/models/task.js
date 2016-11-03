import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  "datasetId": DS.attr(),
  "type": DS.attr(),
  "name": DS.attr(),
  "state": DS.attr(),

  "checkStartedTime": DS.attr(),
  "checkCompletedTime": DS.attr(),
  "status": DS.attr(),
  "warnings": DS.attr(),
  "totalWork": DS.attr(),
  "completedWork": DS.attr(),
  "customMetric": DS.attr(),
  "warningCt": DS.attr(),

  "lastCompletedTime": DS.attr(),
  "lastStartedTime": DS.attr(),
  "lastErrorTime": DS.attr(),
  "lastError": DS.attr(),
  "lastWarnings": DS.attr(),
  "lastStatus": DS.attr(),
  "lastTotalWork": DS.attr(),
  "lastCompletedWork": DS.attr(),
  "lastCustomMetric": DS.attr(),
  "lastWarningCt": DS.attr(),

  isCompleted: Ember.computed.equal('state', 'Completed'),
  isRunning: Ember.computed.equal('state', 'Running'),
  isError: Ember.computed.equal('state', 'Error'),

  everCompleted: function () {
    return this.get('state') === 'Completed' || this.get('lastCompletedTime');
  }.property('state', 'lastCompletedTime'),

  class_UI: function () {
    if (this.get('state') === 'Running') {
      return "";
    }
    else if (this.get('lastError')) {
      return "danger";
    }
    else if (this.get('lastWarnings').length > 0 || this.get('warnings').length > 0) {
      return "warning";
    }
    else {
      return "success";
    }
  }.property('state', 'lastError', 'warnings_small'),

  runningTime: function () {
    let ls = this.get('checkStartedTime');
    if (!ls) {
      return null;
    }
    let lsm = moment(ls);
    let lcm = moment();
    if (lsm.isAfter(lcm)) {
      return null;
    }
    return lcm.diff(lsm, 'seconds');
  }.property('checkStartedTime'),

  timeTaken: function () {
    let ls = this.get('lastStartedTime');
    let lc = this.get('lastCompletedTime');
    if (!ls || !lc) {
      return null;
    }
    let lsm = moment(ls);
    let lcm = moment(lc);
    if (lsm.isAfter(lcm)) {
      return null;
    }
    return lcm.diff(lsm, 'seconds');
  }.property('lastStartedTime', 'lastCompletedTime')
});
