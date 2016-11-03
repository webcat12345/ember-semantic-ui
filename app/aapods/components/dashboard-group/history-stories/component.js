import Ember from 'ember';

export default Ember.Component.extend({
  isAdmin: Ember.computed.bool('user.is_staff'),
  more: false,
  minstories: 3,
  maxstories: 10,
  showalert: false,
  validstories: function(){
    return this.get("stories").filter((x)=>{
       return x.get("metricId")
    });
  }.property("stories.@each"),
  showmore: function(){
    let numstories = this.get("numstories");
    return numstories > this.get("minstories");
  }.property("numstories"),
  numstories: function(){
    let stories =  this.get("validstories");
    if(stories){
      return stories.get("length");
    }
    return 0;
  }.property("validstories"),
  topstories: function(){
    let stories =  this.get("validstories");
    if(this.get("more")){
      return stories.slice(0, this.maxstories);
    }else{
      return stories.slice(0, this.minstories);
    }
  }.property("validstories.@each", "more"),
  actions: {
    'toggleMore': function(){
      this.toggleProperty("more");
    },
    'trashstory': function(story){
      let _this=this;
      story.destroyRecord().then(function () {
//         _this.$("#success-alert").fadeTo(2000, 500).slideUp(500, function(){
//     $("#success-alert").alert('close');
// });
      });
    }
  }
});
