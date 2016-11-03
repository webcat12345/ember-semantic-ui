import Ember from 'ember';

const not = (params) => !params[0];
export default Ember.Helper.helper(not);
