import Ember from 'ember';

export function barColor(params/*, hash*/) {
  if(params < 0){
    return "red"
  }else{
    return "green"
  }
}

export default Ember.Helper.helper(barColor);
