import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Component.extend({
  tagName: '',
  classNames: ['nav','in'],
  searchText:"",
  qstartDate: null,
  qendDate:null,
  ranges: null,
  types:['Positive', 'Negative'],
  dp: function(){
      Ember.run.once(this, 'processDates')
  }.observes("qstartDate", "qendDate"),
  processDates: function(){
    this.sendAction("datePicked", this.qstartDate, this.qendDate);
  },
  topranges: function(){
    var today = moment();
    var ranges = [{name:'Yesterday', endDate: moment(today).format('YYYY-MM-DD'), startDate:moment(today).subtract(1, 'days').format('YYYY-MM-DD')},
                {name:'Last 7 Days', endDate: moment(today).format('YYYY-MM-DD'), startDate:moment(today).subtract(7, 'days').format('YYYY-MM-DD')},
                {name:'Last 30 Days', endDate: moment(today).format('YYYY-MM-DD'), startDate:moment(today).subtract(30, 'days').format('YYYY-MM-DD')}]
    return ranges;
  }.property('ranges'),
	actions: {
    toggle: function(event){
       var viewElements = event.element;
       var ul = viewElements.getElementsByTagName('ul');
       if(ui.hasClass('in'))
       {
        ul.removeClass('in');
       }
       else{
        ul.addClass('in');
       }
    },

    search: function(){
      //this.sendAction("loading",true);
      this.sendAction("search",this.get("searchText"));
    },
    follows: function(entity, state, val){
      var action = undefined;
      if(state)
      {
        action="follow";
      }
      else
      {
        action= "unfollow";
      }
      Ember.$.get(ENV.api_endpoint + "/feed/feed/follows", {feed_id:this.get("feed_id"), entity: entity, action: action, val: val}).then((resp)=>{
         this.sendAction();
       });
    },
    period_change: function() {

    }
  }
});
