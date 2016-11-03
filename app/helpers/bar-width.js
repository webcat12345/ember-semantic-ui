import Ember from 'ember';

export function barWidth(params/*, hash*/) {
  return Math.abs(params)*1.5;
}

export default Ember.Helper.helper(barWidth);
