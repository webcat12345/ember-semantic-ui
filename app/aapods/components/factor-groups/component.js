import Ember from 'ember';
import {_groups} from 'datasenseui/utils/why-utils';
import ENV from 'datasenseui/config/environment';
export default Ember.Component.extend({
  tagName:'',
  currFunnel: {metrics:null,name:null},
  funnels: function(){
    this.set("loadingFunnels", true);
    let funnels = _groups(this.get("factors"), true);
    // let dims =
    // let funHash = {};
    // dims.forEach(function(val){
    //   if (val.get("group")) {
    //     let groups = val.get("group").split(",");
    //     groups.forEach(function (grp) {
    //       if (!(grp in funHash)) {
    //         funHash[grp] = {metrics:Ember.A([]), name: grp}
    //       }
    //       funHash[grp].metrics.addObject({id:val.get("id"), text: val.get("name")});
    //     });
    //   }
    // });
    // let funnels = Ember.A([]);
    // for (var val in funHash){
    //   funnels.addObject(funHash[val]);
    // };
    this.set("loadingFunnels", false);
    return funnels;
  }.property("factors.@each.group"),
  dmetrics: function(){
    let ms = this.get("factors");
    let res = [];
    ms.forEach(function(val){
      res.push({id:val.get("id"), text: val.get("name")});
    })
    return res;
  }.property("factors"),
  isDisabled: function(){
    let currFunnel = this.get("currFunnel");
    if(currFunnel.name && currFunnel.metrics){
      return false;
    }else{
      return true;
    }
  }.property("currFunnel.name", "currFunnel.dimensions"),
  actions: {
    createFunnel: function(){
      let funnels = this.get("funnels");
      let currFunnel = this.get("currFunnel");
      let currFunnelName = this.get("currFunnel.name");
      //check if there is an already existing funnel then raise error
      //let exists = funnels.map(function(e) { return e.name; }).indexOf(currFunnelName);
      //if(exists === -1){
      let alldims = this.get("factors");
      currFunnel.metrics.forEach(function (val) {
        let dimpos = alldims.map(function (e) { return e.id; }).indexOf(val.id);
        let seldim = alldims.objectAt(dimpos)
        let grparr = seldim.get("group").split(",");
        grparr.push(currFunnelName);
        seldim.set("group", grparr.join(','));
        let onSuccess = function (msg) {
          console.log(msg);
        };
        let onFail = function (msg) {
          console.log(msg);
        }
        seldim.save().then(onSuccess, onFail);
      });
      // }
      // else{
      //   console.log("Give a different name to the group, this already exists");
      // }

      //funnels.addObject(this.get("currFunnel"));
      this.send("newFunnel");
    },
    changeFunnel: function(funnel){
      this.set("currFunnel", funnel);
    },
    newFunnel: function(){
     this.set("currFunnel", {});
    },
    deleteFunnel: function(funnel){
      let alldims = this.get("factors");
      funnel.metrics.forEach(function(val){
        let dimpos = alldims.map(function (e) { return e.id; }).indexOf(val.id);
        let seldim = alldims.objectAt(dimpos)
        let grparr = seldim.get("group").split(",");
        let pos = grparr.indexOf(funnel.name);
        if(pos > -1){
          grparr.splice(pos,1);
        }
        seldim.set("group", grparr.join(','));
        let onSuccess = function (msg) {
          console.log(msg);
        };
        let onFail = function (msg) {
          console.log(msg);
        }
        seldim.save().then(onSuccess, onFail);
      })
      this.send("newFunnel");
    }
  }
});
