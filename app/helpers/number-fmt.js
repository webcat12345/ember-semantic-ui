import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function (type, number) {
  if (!number) {
    return 0;
  }
  if (number < 0 && number > -0.01) {
    number = -0.01;
  } else if (number > 0 && number < 0.01) {
    number = 0.01;
  }
  number = Number(number);

  if (type === 'percentage') {
    return (number * 100).toFixed(2) + "%";
  } else if (type === "percdec") {
    return (number / 100).toFixed(2);
  } else if (type === "perc") {
    return number.toFixed(2);
  } else if (type === "percunit") {
    return number.toFixed(2) + "%";
  } else if (type === "metric") {
    return number.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else if (type === "absperc") {
    return Math.abs(number).toFixed(2);
  } else if (type === "int") {
    return number.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else if (type === "commas") {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else if (type === "change") {
    var nc = number.toFixed(0);
    if (nc > 0) {
      return "+" + nc;
    } else {
      return nc;
    }
  } else if (type === "changepercunit") {
    var n = number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return Math.abs(n) + "%";
  } else if (type === "changeperc") {
    var n = number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (n > 0) {
      return "+" + n;
    } else {
      return n;
    }
  } else {
    return number;
  }
});
