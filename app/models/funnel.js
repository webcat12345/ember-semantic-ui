import Ember from 'ember';
import DS from 'ember-data';
import {parseFilters, compileFilters} from 'datasenseui/utils/filter-utils';

const StepDerived = Ember.Object.extend({
  filters: null,
  filterQueryString: null,
  step: null,
  init: function () {
    let s = this.get('step');
    if (s === 'true') {
      s = '';
    }
    this.set('filters', parseFilters(s));
    this.set('filterQueryString', s);
  },
  setStep: function () {
    this.set('step', this.get('filterQueryString'));
  }.observes('filterQueryString')
});

export default DS.Model.extend({
  datasetId: DS.attr(),
  name: DS.attr(),
  steps: DS.attr(),
  tags: DS.attr(),
  derivedSteps: null,
  setDerivedSteps: function () {
    const s = this.get('steps');
    if (!s || this.get('derivedSteps')) {
      return;
    }
    const derived = Ember.A([]);
    let _this = this;
    s.forEach(function (step, index) {
      derived.pushObject(StepDerived.create({
        step: step
      }));
    });
    this.set('derivedSteps', derived);
  }.observes('steps.@each').on('init'),

  setSteps: function () {
    let ds = this.get('derivedSteps').map(function (d) {
      let st = d.get('step');
      if (!st) {
        st = 'true';
      }
      return st;
    });

    let steps = this.get('steps');
    if (steps.length === ds.length) {
      let diff = false;
      for (let ii = 0; ii < ds.length; ii++) {
        if (ds[ii] !== steps[ii]) {
          diff = true;
          break;
        }
      }
      if (diff) {
        this.set('steps', ds);
      }
    } else {
      this.set('steps', ds);
    }
  },
  runSetSteps: function () {
    Ember.run.once(this, 'setSteps');
  }.observes('derivedSteps.@each.step'),
  isValid: function () {
    if (!this.get('name')) {
      return false;
    }
    const s = this.get('steps');
    if (!s || s.length < 1) {
      return false;
    }
    for (let i = 0; i < s.length; i++) {
      if (i > 0 && (!s[i] || s[i] === 'true')) {
        return false;
      }
    }
    return true;
  }.property('name', 'steps'),
  addStep: function () {
    let ds = this.get('derivedSteps');
    if (ds) {
      ds.pushObject(StepDerived.create({
        step: 'true'
      }));
    }
  },
  removeStep: function (index) {
    let ds = this.get('derivedSteps');
    if (ds) {
      ds.removeAt(index);
    }
  }
});
