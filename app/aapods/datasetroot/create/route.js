import Ember from 'ember';


export default Ember.Route.extend({
  model: function() {
    var app = this.modelFor('datasetroot');
    var ajaxDatasets = [];
    for(var i=0; i< app.datasets; i++)
    {
  		if(("type" in app.datasets[i]) && app.datasets[i]["type"] === "ajax"){
  			ajaxDatasets.push(app.datasets[i]);
  		}
    }
	  return Ember.RSVP.hash({datasets: ajaxDatasets});
  }
});
