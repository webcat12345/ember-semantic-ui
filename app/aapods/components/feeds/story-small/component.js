import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Component.extend({
  comment: "",
  show_scores: false,
  show_segment_scores: false,
  compare: Ember.inject.service('compare'),
  processExplain: function () {
    Ember.run.once(this, 'getExplain');
  }.observes('f').on('init'),
  getExplain: function () {
    var story = this.get('f');
    var dataset_id = this.get('dataset').id;
    var metric_id = story.id;
    var factor_id = story.datefactorid;
    var filter = story.filter;
    var apt = story.prevdatecol;
    var bpt = story.datecol;
    if (!dataset_id || !metric_id || !factor_id || !apt || !bpt) {
      return;
    }
    this.set('loading', true);
    var _this = this;
    this.get('compare').get_compare({
      dataset_id: dataset_id,
      metric_id: metric_id,
      factor_id: factor_id,
      filter: filter,
      a: apt,
      b: bpt,
      statsig_only: null,
      sortby: 'contribdiff',
      direction: null
    }).then(function (data) {
        if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
          _this.set('loading', false);
          _this.set('whyResults', data);
        }

      }, function (error) {
        _this.set('loading', false);
        console.log(error);
      }
    );
  },
  actions: {
    show: function () {
      // body...
      var s = this.get("show_scores");
      if (s === false) {
        this.set("show_scores", true);
      }
      else {
        this.set("show_scores", false);
      }
    },

    show_segment: function () {
      // body...
      var s = this.get("show_segment_scores");
      console.log(s)
      if (s === false) {
        this.set("show_segment_scores", true);
      }
      else {
        this.set("show_segment_scores", false);
      }
      var s = this.get("show_segment_scores");
      console.log(s)
    },

    seeMore: function (id) {
      this.$('.' + id).toggle('fast');
    },

    like: function (f) {
      Ember.$.get(ENV.api_endpoint + "/feed/story/like", {story_id: f._id, like: 1}).then(function (resp) {
        if (resp["_id"]) {
          f.set("totallikes", parseInt(f.get("totallikes")) + 1);
          f.set("liked", true);
        }
      });
    },
    unfollow: function (f, val, type) {
      //this.get('loading')(true);
      var feed_id = this.get("model.feed_id");
      Ember.$.get(ENV.api_endpoint + "/feed/story/unfollow", {id: f, type: type, val: val}).then((resp)=> {
        this.sendAction();
      });
    },
    unlike: function (f) {
      Ember.$.get(ENV.api_endpoint + "/feed/story/like", {story_id: f._id, like: -1}).then(function (resp) {
        if (resp["_id"]) {
          f.set("totallikes", parseInt(f.get("totallikes")) - 1);
          f.set("liked", false);
        }
      });
    },
    comment: function () {
      var f = this.get("f");
      Ember.$.get(ENV.api_endpoint + "/feed/story/comment", {
        story_id: f._id,
        comment: this.comment
      }).then(function (resp) {
        if (resp) {
          f.set("comments", resp);
        }
      });
    },

    comp: function (dataset_id, fltr, metric_id, factor_id, sd, ed, a, b) {
      this.set('loading', true);
      var _this = this;
      Ember.$.get(ENV.api_endpoint + '/pattern/whyStatus/', {
        dataset_id: dataset_id,
        metric_id: metric_id,
        factor_id: factor_id,
        filter: fltr,
        start_date: sd,
        end_date: ed,
        a: a,
        b: b
      }).then(function (data) {
          if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {

            _this.set('loading', false);
            data['metric_id'] = metric_id;
            data['a'] = a;
            data['b'] = b;
            data['fltr'] = fltr;
            data['factor_id'] = factor_id;
            data['sd'] = sd;
            data['ed'] = ed;
            data['dataset_id'] = dataset_id;
            if (data['percent'] >= 90.0) {
              //redirect to compare.explain
              _this.get('currentController').transitionToRoute('compare.explain', {
                queryParams: {
                  'metric_id': metric_id,
                  a: a,
                  b: b,
                  fltr: fltr,
                  factor_id: factor_id,
                  sd: sd,
                  ed: ed,
                  dim: null
                }
              });
            }
            else {
              //show modal
              if (data['adhocwhy_exist'] === 1) {
                _this.send("showModal", "adhocwhyexists-modal", data);
              }
              else {
                if (data['requests'] <= 0) {
                  _this.send("showModal", "adhocwhyexceeded-modal", data);
                }
                else {
                  _this.send("showModal", "adhocwhy-modal", data);
                }
              }

            }

          }
        }, function (error) {
          _this.set('loading', false);
          console.log(error);
        }
      );
    }

  }
});
