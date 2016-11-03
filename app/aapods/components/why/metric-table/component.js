import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    isPie: false,
    actions: {
        toggleViz: function(){
            this.toggleProperty('isPie');
        },
        metricwhy: function(point){
            this.sendAction('metricwhy', point);
        },
        
    }
});
