import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  fetchVals: false,
  //currFunnel: {metrics:null,name:null},
  funnels: function () {
    this.set("loadingFunnels", true);
    let dims = this.get("factors");
    let funHash = {};
    dims.forEach(function (val) {
      if (val.get("group")) {
        let groups = val.get("group").split(",");
        groups.forEach(function (grp) {
          if (!(grp in funHash)) {
            funHash[grp] = {metrics: Ember.A([]), name: grp};
          }
          funHash[grp].metrics.addObject({id: val.get("id"), text: val.get("name"), isactive: false});
        });
      }
    });
    let funnels = Ember.A([]);
    for (var val in funHash) {
      funnels.addObject(funHash[val]);
    }

    this.set("loadingFunnels", false);

    if (!this.get("currFunnel")) {
      this.set("currFunnel", funnels.objectAt(0));
    }
    return funnels;
  }.property("factors.@each.group"),
  dmetrics: function () {
    let ms = this.get("factors");
    let curr = this.get("currFunnel");
    let currSet = new Set();
    if (curr && curr.metrics) {
      curr.metrics.forEach(function (val) {
        currSet.add(val.id);
      });
    }
    let res = Ember.A([]);
    ms.forEach(function (val) {
      let tmp = Ember.Object.create({id: val.get("id"), text: val.get("name"), following: currSet.has(val.get("id"))});
      res.pushObject(tmp);
    });
    return res;
  }.property("factors", "currFunnel"),
  isDisabled: function () {
    let currFunnel = this.get("currFunnel");
    if (!currFunnel || !currFunnel.name) {
      return true;
    }
    return false;
  }.property("currFunnel.name"),
  actions: {
    createFunnel: function () {
      let currFunnelName = this.get("currFunnel.name");
      let dmetrics = this.get("dmetrics");
      let alldims = this.get("factors");
      //check if there is an already existing funnel then raise error
      //let exists = funnels.map(function(e) { return e.name; }).indexOf(currFunnelName);
      //if(exists === -1){
      dmetrics.forEach(function (val) {
        let dimpos = alldims.map(function (e) {
          return e.id;
        }).indexOf(val.id);
        let seldim = alldims.objectAt(dimpos);
        let dimg = seldim.get("group");
        let grparr = [];
        if (dimg) {
          grparr = dimg.split(",");
        }
        let onSuccess = function (msg) {
          console.log(msg);
        };
        let onFail = function (msg) {
          console.log(msg);
        };
        if (val.following) {
          let pos = grparr.indexOf(currFunnelName);
          if (pos === -1) {
            grparr.push(currFunnelName);
            seldim.set("group", grparr.join(','));
            seldim.save().then(onSuccess, onFail);
          }
        } else {
          let pos = grparr.indexOf(currFunnelName);
          if (pos > -1) {
            grparr.splice(pos, 1);
            seldim.set("group", grparr.join(','));
            seldim.save().then(onSuccess, onFail);
          }
        }


      });
      // }
      // else{
      //   console.log("Give a different name to the group, this already exists");
      // }

      //funnels.addObject(this.get("currFunnel"));
      //this.send("newFunnel");
    },
    changeFunnel: function (funnel) {
      this.set("currFunnel", funnel);
    },
    newFunnel: function () {
      this.set("currFunnel", {});
    },
    selectAll: function (flag) {
      let dmetrics = this.get("dmetrics");
      dmetrics.forEach(function (val) {
        val.set("following", flag);
      });
    }
    // deleteFunnel: function(funnel){
    //   let alldims = this.get("factors");
    //   funnel.metrics.forEach(function(val){
    //     let dimpos = alldims.map(function (e) { return e.id; }).indexOf(val.id);
    //     let seldim = alldims.objectAt(dimpos)
    //     let grparr = seldim.get("group").split(",");
    //     let pos = grparr.indexOf(funnel.name);
    //     if(pos > -1){
    //       grparr.splice(pos,1);
    //     }
    //     seldim.set("group", grparr.join(','));
    //     let onSuccess = function (msg) {
    //       console.log(msg);
    //     };
    //     let onFail = function (msg) {
    //       console.log(msg);
    //     }
    //     seldim.save().then(onSuccess, onFail);
    //   })
    //   this.send("newFunnel");
    // }
  }
});
