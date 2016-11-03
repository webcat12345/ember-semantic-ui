import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Component.extend({
  tagName:'',
  getDimVals: function(){
      if(this.get("segment.selDim")){
      Ember.$.get(ENV.api_endpoint + '/schema/dimensionsValues/' + this.get("segment.selDim").id + '/')
        .then((dimensionsValues)=> {
          dimensionsValues = dimensionsValues.map((dim)=> {
            return {id: dim, name: dim, value: encodeURI(dim)};
          });
          this.set("segment.values", dimensionsValues);
        });
    } else {
      this.set("segment.values", null);
    }
  }.observes('segment.selDim'),
  actions: {
    removeSegment: function(segment){
      this.sendAction('removeSegment',segment);
    }
  }
});
