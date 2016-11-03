import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  loading: true,
  showMore: false,
  defResults: 4,
  storyResults: Ember.inject.service("story-results"),
  getPoints: function (change, sort) {
    this.set("loading", true);
    let points = Ember.A([]);
    let len = change.facets.length;
    if (!this.get("showMore")) {
      len = this.defResults;
    }
    let arr = change.facets.slice(0, len);
    let maxScore = 0;
    arr.forEach(function (val) {
      const absScore = Math.abs(val[sort.key]);
      maxScore =  Math.max(maxScore, absScore);
      points.push(Ember.Object.create({facet: val, score: val[sort.key], absScore: absScore, barLength: absScore}));
    });
    if (maxScore > 100) {
      points.forEach(function(pt){
        pt.barLength = pt.barLength * 100 / maxScore;
      });
    }
    this.set("loading", false);
    return points;
  },
  getStoryResults: function () {
    this.set("loading", true);
    let story = this.get("story");
    story.dim = this.get("dim");
    let change = this.get("storyResults").results(story);
    let _this = this;
    change.then(function (change) {
        if (_this) {
          _this.set("results", change);
          _this.set("loading", false);
        }
      }, function (error) {
        console.log(error);
        if (_this) {
          _this.set("loading", false);
        }
      }
    );
  },
  didInsertElement: function () {
    this.setResults();
    //debugger;
  },
  setPoints: function () {
    this.set("points", this.getPoints(this.get("results"), this.get("story").sort));
  }.observes("results", "showMore"),
  setResults: function () {
    Ember.run.once(this, 'getStoryResults');
  }.observes("dim", "story"),
  isDebug: false,
  actions: {
    toggleShowMore: function () {
      this.toggleProperty("showMore");
    },
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
    }
  }
});
