import Ember from 'ember';
import ChartController from '../mixin';
import ENV from 'datasenseui/config/environment';
import {_isDisabled,_segFilters} from 'datasenseui/utils/charting-utils';

export default Ember.Controller.extend({
  segments:[],
  props: ['controlDim','targetMetric','selVariationVal','qstartDate','qendDate'],
  isDisabled: function(){
    return _isDisabled(this.props, this);
  }.property('controlDim','targetMetric','selVariationVal','qstartDate','qendDate'),
  //testmetrc: [{id:1,text:'asd'},{id:1, text:'asd'},{id:1, text:'asdaa'}],
  dmetrics: function(){
    let ms = this.get("model.metrics");
    let res = [];
    ms.forEach(function(val){
      res.push({id:val.get("id"), text: val.get("name")});
    })
    return res;
  }.property("model.metrics"),
  getDimVals: function(dim, val){
    if(this.get(dim)){
      Ember.$.get(ENV.api_endpoint + '/schema/dimensionsValues/' + this.get(dim).id + '/')
        .then((dimensionsValues)=> {
          dimensionsValues = dimensionsValues.map((dim)=> {
            return {id: dim, name: dim, value: encodeURI(dim)};
          });
          this.set(val, dimensionsValues);
        });
    } else {
      this.set(val, null);
    }
  },
  controlVals: function(){
    let controlVals = this.get("_controlVals");
    let res = [];
    if(controlVals){
      controlVals.forEach(function(val){
        res.push({id:val.id, text: val.name});
      });
    }
    return res;
  }.property("_controlVals"),
  getControlVals: function(){
    this.getDimVals("controlDim", "_controlVals");
  }.observes("controlDim"),
  actions: {
    addSegment: function(){
      let segments = this.get("segments");
      segments.addObject({selFun: this.get("model.functions")[0]});
      this.set("segments", segments);
    },
    removeSegment: function(segment){
      let segments = this.get("segments");
      segments.removeObject(segment);
      this.set("segments", segments);
    },
    optimize: function(){
      //let variation = Ember.$('input[name="variation"]:checked').val();
      let control = $('input[name=control]:checked').val();
      let apt = null;
      switch (control){
        case "rest":
          apt = "rest";
          break;
        default:
          apt = this.get("controlDim").id + "==" + this.get("selControlVal").id;
      }
      const transition = {
        queryParams: {
          'metric_id': this.get("targetMetric").id,
          a: apt,
          b: this.get("controlDim").id + "==" + this.get("selVariationVal").id,
          fltr: _segFilters(this.get("segments")),
          factor_id: this.get("controlDim").id,//this.get("model.dashboard.date"),
          sd: this.get("qstartDate"),
          ed: this.get("qendDate"),
          dim: null
        }
      };
      this.transitionToRoute('compare.explain', transition);
    }
  }
})
;

