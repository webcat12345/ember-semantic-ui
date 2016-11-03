import Ember from 'ember';

export default Ember.Component.extend({
    actions:{
        answerClick: function(point){
            this.sendAction('answerClick', point);
        }
    }
});