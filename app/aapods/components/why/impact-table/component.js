import Ember from 'ember';
import WhyController from '../../../apps/mixin';

export default Ember.Component.extend(WhyController, {
  tagName: '',
  showCt: 5,
  firstTime: true,
  a: null,
  b: null,
  fltr: null,
  isAdmin: null,

  transitionToRoute(name, params) {
    this.get('queryParams').forEach((param)=> {
      if (param !== 'dim' && param in params.queryParams) {
        this.set(param, params.queryParams[param]);
      }
    });
    params.queryParams.dim = this.get('dim');
    this.initialize(params.queryParams);
  },
  observer: function () {
    let model = this.get('model');
    let params = {};
    this.get('queryParams').forEach((param)=> {
      if (param !== 'dim' && param in model.params) {
        params[param] = model.params[param];
      }
    });
    this.transitionToRoute("", {queryParams: params});
  }.observes('model', 'dim'),

  init: function(){
    this._super(...arguments);
    this.observer();
  },
  sendResultsBack: function () {
    if (this.firstTime) {
      let callback = this.get('setResults');
      if (callback) {
        callback(this.get('results'));
      }
      this.set('firstTime', false);
    }

  }.observes('results'),
  actions: {
    showMore: function (show) {
      if (this.get('displaySettings.showMoreInline')) {
        this.set('showMore', show);
      } else {
        let callback = this.get('selectDimension');
        if (callback) {
          callback(this.get('resultDimension'), this.get('dim'), true);
        }
      }
    },
    toggleSignificant: function () {
      if (this.get('displaySettings.toggleSignificantInline')) {
        this.set('statsig_only', true);
      } else {
        let callback = this.get('selectDimension');
        if (callback) {
          callback(this.get('resultDimension'), this.get('dim'), true);
        }
      }
    }
  }
});
