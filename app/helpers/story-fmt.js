/**
 * Created by maurinlenglart on 3/16/16.
 */
import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function (my_data, type) {
  if(my_data<1000){
    return my_data
  }else if (moment(my_data).isValid()) {
    if (type === 'Month') {
        return moment(my_data).format("MMM D");
    } else if (type === 'Year') {
        return moment(my_data).format("MMM D YYYY");
    }
  } else {
    return my_data
  }
});
