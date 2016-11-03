import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function (str1, str2) {
  return str1 + str2;
});
