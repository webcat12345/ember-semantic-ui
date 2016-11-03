import Ember from 'ember';
import ChartController from '../mixin';


export default Ember.Controller.extend(ChartController, {
  disableDraw: false,
  dimensions: [],
  dim_inc: 0,
  setSelectedChartType(type, stack) {
    this.set('selectedChartType', 'session');
  },

  actions: {
    removeDimension: function (id) {
      const dim = this.get('dimensions').findBy('id', id);
      const dimObjectIdx = this.get('dimensions').indexOf(dim);
      if (dimObjectIdx !== -1) {
        this.get('dimensions').removeAt(dimObjectIdx);
      }
    },
    addDimension: function(){
      const dim_ids = this.get('dimensions').map((x)=>x.id).sort();
      let id = this.get('dim_inc');
      this.set('dim_inc', id + 1);
      this.get('dimensions').addObject({dimsId: '', id: 'dimSelect_' + id});
    },
    setDimension: function(dim, dimid){
      const dimension = this.get('dimensions').findBy('id', dim['id']);
      dimension['dimsId'] = dimid.id;
    }

  }
});

