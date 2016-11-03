import Ember from 'ember';


export default Ember.Component.extend({
  downloadData: function () {
    const data = this.get('data');
    const header = [''].concat(this.get('data')[0].data.map((x)=>x.name));
    const lines = data.map((x)=> {
      return [x.displayName].concat(x.data.map((x)=>x.y));
    });
    return [header].concat(lines);
  }.property('data'),
  actions: {
    download: function () {
      this.get('csv').export(this.get('downloadData'), 'data.csv');
    }
  }
});
