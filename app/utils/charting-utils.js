import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export function _isDisabled(props, context) {
  let state=false;
  var BreakException= {};
  try{
    props.forEach(function(val){
        if(!context.get(val)){
           state=true;
           throw BreakException; 
        }
    })
  }catch(e){
    if(e!=BreakException) throw e;
  }
  return state;    
}


export function _segFilters(segments) {
  return segments.map(function(val){
    if (val.selDim && val.selFun && val.selVal) {
      return val.selDim.id + val.selFun.value + decodeURI(val.selVal.id);
    }
  }).join(",,");
}