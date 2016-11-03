import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  is_thredup_sessions: function () {
    return this.get('compare').dataset_id === 'thredup_sessions';
  }.property('compare'),
  didInsertElement: function () {
  },
  isDebug: false,
  fpts: function () {
    let pts = this.get("pts");
    let fpts = [];
    let isWinner = this.get("isWinner");
    if (isWinner !== null && isWinner !== undefined) {
      pts.forEach(function (val) {
        if (val.isWinner === isWinner) {
          fpts.push(val);
        }
      });
      return fpts;
    }
    else {
      return pts;
    }
  }.property("pts"),
  scoreMsg: function () {
    const compare_type = this.get("compare_type");
    if (compare_type && compare_type === "optimize") {
      return "Cuberon Score";
    } else {
      return "Root Cause Score";
    }
  }.property("compare_type"),
  showImpact: function () {
    return this.get('isDebug') || this.get('compare_type') !== "optimize";
  }.property('isDebug', 'compare_type'),
  tableMsg: function () {
    const compare_type = this.get("compare_type");
    if (compare_type && compare_type === "optimize") {
      return "Difference";
    } else {
      return "Change";
    }
  }.property("compare_type"),
  actions: {
    exploreSessions: function (point) {
      this.sendAction('exploreSessions', point);
    },
    deeperwhy: function (point) {
      this.sendAction("deeperwhy", point);
    },
    deletedim: function (point) {
      this.sendAction("deletedim", point);
    },
    editFactor: function (point) {
      this.sendAction("editFactor", point);
    },
    selectdim: function (point) {
      this.sendAction("selectdim", point);
    },
    modalForSegment: function (point) {
      this.sendAction("modalForSegment", point);
    },
    modalForContrib: function (point) {
      this.sendAction("modalForContrib", point);
    },
    significantFilter: function () {
      this.sendAction("significantFilter");
    },
    directionFilter: function () {
      this.sendAction("directionFilter");
    },
    whyfunnel: function (point) {
      this.sendAction("whyfunnel", point);
    },
    searchDims: function(searchStr) {
      this.sendAction("searchDims", searchStr);
    }
  }
});
