import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function(object, properties) {
    if (properties) {
      let finalval = object;
      for (let i = 0; i < properties.length; i++) {
        if (!finalval) {
          return null;
        }
        if (finalval instanceof Ember.Object) {
          finalval =  object.get(properties[i]);
        } else {
          finalval = object[properties[i]];
        }
      }
      return finalval;
    }
    return null;
});
