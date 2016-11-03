import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default function _getids(objs) {
    let ids = [];
    if(!objs) return ids;
    objs.forEach(function(obj){
      ids.push(obj.id);
    });
    return ids;
}