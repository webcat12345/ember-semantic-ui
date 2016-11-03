import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    isPie: false,
    blacklist: ['prerun'],
    valid: function(){
        let funnels =  this.get("funnels");
        let valid = Ember.A([])
        let _this=this;
        funnels.forEach(function(val){
            if(_this.blacklist.indexOf(val.name) === -1){
                valid.push(val);
            }
        })
        return valid;
    }.property("funnels"),
    didInsertElement: function(){
      this.sendAction("setFunnel", this.get("funnels")[0]);  
    },
    actions: {
         changeFunnel: function(funnel){
            this.sendAction("setFunnel", funnel);
        }
    }
});
