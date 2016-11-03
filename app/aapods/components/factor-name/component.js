import Ember from 'ember';
export default Ember.Component.extend({
  tagName:'',
  factor: function(){
      let factors = this.get("factors");
      return factors[this.get("id")];
  }.property('factors', 'id')
});