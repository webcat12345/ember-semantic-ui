import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function (number, change, unit) {
  if (!change) {
    change = 0;
  }
  var ch = change.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (change > 0) {
    ch = "+" + ch + "%";
  } else {
    ch = ch + "%";
  }

  if (!number) {
    number = "0";
  }

  number = Number(number);
  return ch + " (" + number.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + unit + ")";
});
