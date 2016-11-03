import Ember from 'ember';
export default Ember.Handlebars.makeBoundHelper(function (p1, p2) {
  return p1 || p2;
});
