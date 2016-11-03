import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function (str, len) {
  if (!str || !len) {
    return str;
  }
  if (str.length > len) {
    return str.substring(0, len) + '...';
  } else {
    return str;
  }
});
