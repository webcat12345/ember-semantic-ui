import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  series: null,

  seriesAsList: function () {
    var s = this.get('chart.series');
    if (!s || s.length <= 0) {
      return [];
    } else {
      var saslist = [];
      for (var j = 0; j < s[0].data.length; j++) {
        var xvals = [];
        for (var i = 0; i < s.length; i++) {
          if (i === 0) {
            xvals.push(s[i].data[j].name);
            xvals.push(s[i].data[j].size);
          }
          xvals.push(s[i].data[j].y);
        }
        saslist.push(xvals);
      }
      return saslist;
    }
  }.property('chart.series')
});

