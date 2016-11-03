import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
    cols: 4,
    needs: ["application"],
    isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
    rows: function(){
      let ds = this.get("model.datasets");
      let rows = Ember.A([]);
      let _this=this;
      ds.forEach(function(val, index){
          let rowid = Math.floor(index / _this.cols);
          if(rows[rowid]===undefined){
              rows[rowid] = Ember.A([]);
          }
          rows[rowid].push(val);
      });
      return rows;
    }.property("datasets"),
  actions: {

  }
});
