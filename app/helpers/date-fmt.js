import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function (date, type) {
  if (!date) {
    return null;
  }
  if (type === "newsfeedfromnow") {
    return moment(date).from(moment(Date.now()).startOf('day'));
  }
  if (type === "fromnow") {
    return moment(date).fromNow();
  }
  if (type === "fromnow2") {
    return moment(Number(date)).fromNow();
  }
  if (type === "short") {
    return moment(date).format("ddd, MMM Do");
  }
  if (type === "year") {
    return moment(date).format("ddd, MMM Do, YYYY");
  }
  if (type === 'header') {
    return moment(date).format("D MMM 'YY");
  }
  return moment(date).calendar();
});
