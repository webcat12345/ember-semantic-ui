import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function(object, property) {
    if (object && property) {
        if (object instanceof Ember.Object) {
          return object.get(property);
        } else {
          return object[property];
        }
    }
    return null;
});
