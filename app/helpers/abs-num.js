import Ember from 'ember';

export function absNum(params/*, hash*/) {
  return Math.abs(params);
}

export default Ember.Helper.helper(absNum);
