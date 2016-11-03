import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function (str) {
  if (!str) {
    return str;
  }
  return str.replace(/\W+/g, "_");
});
