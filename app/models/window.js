import DS from 'ember-data';

export default DS.Model.extend({
  datasetId : DS.attr(),
  startDate: DS.attr(),
  endDate: DS.attr(),
  numDays: function() {
    var s = this.get('startDate');
    var e = this.get('endDate');
    return moment(e).diff(moment(s), "days") + 1;
  }.property('startDate', 'endDate'),
  slStartDate: function(){
  	var s = this.get('startDate');
    var e = this.get('endDate');
    var sl = moment(e).subtract(60, 'days');
    return moment.max(s,sl).format('YYYY-MM-DD'); 
  }.property('startDate')
});
