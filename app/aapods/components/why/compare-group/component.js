import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  showMore: false,
  showChart: true,
  a: null,
  b: null,
  isDeep: function () {
    return this.get('f.key') !== 'Overall';
  }.property('f.key'),

  chart: function () {
    var sa = this.get('a');
    var sb = this.get('b');
    var sf = this.get('compare.compare.factor');
    var m = this.get('compare.compare.metric');
    var ins = this.get('f');
    var aoverall = this.get('compare.results.apt');
    var boverall = this.get('compare.results.bpt');
    if (!sa || !sb || !sf || !m) {
      return null;
    }

    var baseChart = {
      title: {useHTML: true, text: ""},
      chart: {type: "bar"},
      series: null,
      tooltip: {
        borderWidth: 3,
        borderRadius: 2,
        shadow: false,
        useHTML: true,
        percentageDecimals: 2,
        backgroundColor: "white",
        formatter: function () {
          return '<div class="highcharts-tooltip">For <b>' + this.point.ptname + ' ( Point' + this.point.ptalias +
            ' )</b><br><b>' + ins.name + '=' + this.point.name +
            '</b>: <br> &nbsp; <br> - Contributed ' + this.point.contribdiff + '%' +
            this.point.direction + ' than expected. <br>' +
            ' - Net <b>' + this.point.netdiff + ' ( ' + this.point.pctnetdiff + '% )</b> Difference <br>&nbsp;<br>&nbsp;<br>' +
            'Contribution = ' + this.point.contrib + ' / ' + this.point.ptcontrib + '<br>' +
            'Perc Contribution = ' + this.y + '%<br>' +
            m.name + ' = ' + this.point.metric + m.unit_type + '<br>' +
            'Size = ' + this.point.size +
            "</div>";
        }
      },
      xAxis: {
        categories: [],
        title: {
          text: null
        }
      },
      yAxis: {
        title: {
          text: 'Percentage Contribution',
          align: 'high'
        }
      }
    };
    var myc = Ember.$.extend({}, baseChart);
    myc.xAxis.categories = [];
    myc.title.text = m.name + " by " + ins['name'];

    var acolor = aoverall['color'];
    var bcolor = boverall['color'];
    if (acolor === 'green') {
      acolor = "#00a65a";
      bcolor = "#f56954";
    } else {
      acolor = "#f56954";
      bcolor = "#00a65a";
    }
    myc.series = [{name: sa, data: [], color: acolor},
      {name: sb, data: [], color: bcolor}];

    for (var l = 0; l < ins.list.length; l++) {
      var insl = ins.list[l];
      var a = insl['m']['a'];
      var b = insl['m']['b'];
      myc.xAxis.categories.push(insl['n']);
      myc.series[0].data.push({
        name: insl['n'],
        y: Number(Number(a['pmct']).toFixed(2)),
        ptname: sa,
        ptalias: "A",
        size: a['ct'],
        contrib: Number(a['mct']).toFixed(2),
        ptcontrib: Number(aoverall['mct']).toFixed(2),
        netdiff: (-1 * insl['netdiff']).toFixed(2),
        pctnetdiff: (-1 * insl['pctnetdiff']).toFixed(2),
        direction: a['direction'],
        contribdiff: Number(Number(insl['contribdiff'].toFixed(2))),
        metric: Number(a['om']).toFixed(2)
      });
      myc.series[1].data.push({
        name: insl['n'],
        y: Number(Number(b['pmct']).toFixed(2)),
        ptname: sb,
        ptalias: "B",
        size: b['ct'],
        netdiff: (insl['netdiff']).toFixed(2),
        pctnetdiff: (insl['pctnetdiff']).toFixed(2),
        contrib: Number(b['mct']).toFixed(2),
        ptcontrib: Number(boverall['mct']).toFixed(2),
        direction: b['direction'],
        contribdiff: Number(Number(insl['contribdiff'].toFixed(2))),
        metric: Number(b['om']).toFixed(2)
      });
    }
    return Ember.$.extend(true, {}, myc);
  }.property('insights'),
  actions: {
    showMore: function () {
      this.set('showMore', !this.get('showMore'));
    },
    toggleChart: function () {
      this.set('showChart', !this.get('showChart'));
    },
    removeFactor: function () {

    },
    selectFacet: function () {

    },
    removeFacet: function () {

    }
  }
});

