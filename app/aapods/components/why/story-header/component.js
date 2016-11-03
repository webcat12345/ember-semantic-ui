import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  storyMetrics: Ember.inject.service("story-metrics"),
  is_story_computed: function () {
    return this.get('currStory.change.a.om') !== 0 && this.get('currStory.change.b.om') !== 0
  }.property('currStory'),
  metricHash: function () {
    let res = {};
    let dims = this.get("metrics");
    dims.forEach(function (val) {
      res[val.id] = val;
    });
    return res;
  }.property("metrics"),
  compareUrl: function () {
    return window.location.origin + this.get('currStory.compareUrl');
  }.property("currStory.compareUrl"),
  storyObj: function () {
    let story = this.get("story");
    if (story && story.get("metricId")) {
      let storyObj = story.toJSON();
      storyObj.metric_id = storyObj.metricId;
      storyObj.factor_id = storyObj.factorId;
      storyObj.dataset_id = storyObj.datasetId;
      let change = this.get("storyMetrics").metrics(storyObj);
      let _this = this;
      change.then(function (change) {
          story.change = change;
          _this.set("currStory", story);
        }, function (error) {
          console.log(error);
        }
      );
    }
  }.observes('story'),
  actions: {
    explore: function () {
      this.get('router').transitionTo('compare.explain', {
        queryParams: {
          metric_id: this.get("currStory.metricId"),
          a: this.get('currStory.a'),
          b: this.get('currStory.b'),
          fltr: this.get('currStory.fltr'),
          factor_id: this.get('currStory.factorId'),
          sd: this.get('currStory.sd'),
          ed: this.get('currStory.ed'),
        }
      });
    },
    trash: function () {
      this.sendAction("trashstory", this.get("story"));
      // let story = this.get("story");
      // var _this = this;
      // story.destroyRecord().then(function () {

      // });
    }

  }
});
