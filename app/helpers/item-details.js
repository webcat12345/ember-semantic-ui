import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function(property, options) {
	var skipList  = options.hash['skipList'];
  var model = options.data.keywords.row;
  for(var k=0; k < skipList.length; k++)
  {
    model.splice(k,1);
  }
  var ret='';
  for(var i=0; i+3<model.length; i=i+3) {
    //skip image and title
    ret = ret + '<div class="row">';
    for(var j=0; i+j < model.length; j++){
      ret = ret + '<div class="col-md-4">' + model[i+j].value + '</div>';
    }
    ret = ret + '</div>';
  }
  return new Ember.Handlebars.SafeString(ret);
});
