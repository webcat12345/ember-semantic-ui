import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  change: 0,
  loading: true,
  actions: {
    loadDone: function(data) {
      let change = 0;
      if (!data) {
        return;
      }
      let sd = this.get('startDate');
      let ed = this.get('endDate');
      let val1 = 0;
      let val2 = 0;
      for(let i=0; i < data.series.length; i++)
      {
        if(data.series[i]['name'] === sd) {
          val1 = data.series[i].y;
        }
        if (data.series[i]['name'] === ed){
          val2 = data.series[i].y;
        }
      }
      if (val1 === 0 && val2 === 0) {
        change = 0;
      } else if (val1 === 0) {
        change = 100;
      } else {
        change = (val2 - val1) * 100 / val1;
      }
      this.set('change', change);
      this.set('loading', false);
    },
    mclick: function() {
      this.get('mclick')(this.get('selectedMetricId'));
    }
  }
});
