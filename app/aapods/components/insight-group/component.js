import Ember from 'ember';
import Compare from '../../../utils/compare';
import SchemaFilter from '../../../utils/schema-filter';

export default Ember.Component.extend({
  tagName:'div',
  showMore: false,
  show: function() {
    var g = this.get('group');
    if (g.key === 'Overall') {
      return 'outlier';
    } else {
      return 'expected';
    }

  }.property('group'),
  isDeep: function() {
    return this.get('group.key') !== 'Overall';
  }.property('group.key'),
  showOutlier: Ember.computed.equal('show', 'outlier'),
  showGrid: Ember.computed.equal('show', 'grid'),
  showExpected: Ember.computed.equal('show', 'expected'),
  selectedA: null,
  selectedB: null,
  compare: function() {
    var sa = this.get('selectedA');
    var sb = this.get('selectedB');
    if (!sa || !sb) {
      return null;
    }

    var g = this.get('group');
    var sf = this.get('schemaFilter');

    var newsf = SchemaFilter.create({schema: sf.schema});
    newsf.set('et_id', sf.get('et_id'));
    newsf.set('m_id', sf.get('m_id'));
    newsf.set('date_name', sf.get('date_name'));
    var cmp = Compare.create({schemaFilter: newsf});
    cmp.set('f_id', g.factor.get('id'));
    cmp.set('a_id', sa);
    cmp.set('b_id', sb);
    return cmp;
  }.property('selectedA', 'selectedB'),
  togglePoint: function(pt) {
    var g = this.get('group');
    for (var i = 0; i < g.facets.length;  i++) {
      if (g.facets[i].v === pt.name) {
        this.select(g.facets[i]);
        //pt.select(g.facets[i].insight.get('selected'));
        return;
      }
    }
  },
  select: function(facet) {
    var id = facet.facet.get('id');
    var sa = this.get('selectedA');
    var sb = this.get('selectedB');
    if (sa && sa === id) {
      facet.insight.set('selected', false);
      this.set('selectedA', null);
      return false;
    }
    if (sb && sb === id) {
      facet.insight.set('selected', false);
      this.set('selectedB', null);
      return false;
    }
    if (facet.insight.get('selected')) {
      facet.insight.set('selected', false);
      return false;
    }

    if (!sa) {
      this.set('selectedA', id);
      facet.insight.set('selected', true);
      return true;
    }
    if (!sb) {
      this.set('selectedB', id);
      facet.insight.set('selected', true);
      return true;
    }

    //Both SA and SB are set
    this.set('selectedA', id);
    facet.insight.set('selected', true);
    var g = this.get('group');
    for (var i = 0; i < g.facets.length; i++) {
      var fid = g.facets[i].facet.get('id');
      if (fid === sa) {
        g.facets[i].insight.set('selected', false);
        return;
      }
    }
    return true;
  },

  chart: function() {
    var group = this.get('group');
    var metric = this.get('schemaFilter.metric');
    var facets = group.facets;

    var underperfs = [];
    var overperfs = [];
    var regulars = [];

    for (var i = 0; i < facets.length; i++) {
      var insight = facets[i];

      var pt = {
        x: insight.insight.scores.total,
        y: Number(Number(insight.kdelta).toFixed(2)),
        z: 1,
        size: insight.insight.scores.total,
        metric: Number(insight.insight.get('scores.final')).toFixed(2),
        name: String(insight.v),
        exp: Number(insight.edelta).toFixed(2),
        rfinal: Number(insight.rfinal).toFixed(2)
      };
      if (insight.klvl === "success") {
        overperfs.push(pt);
      } else if (insight.klvl === "danger") {
        underperfs.push(pt);
      } else {
        regulars.push(pt);
      }
    }
    var _this = this;
    return {
      chart: {
        type: 'scatter',
        zoomType: 'xy'
      },
      //subtitle: {text: group.key},
      tooltip: {
        formatter: function () {
          return '<b>' + this.point.name + '</b><br>' +
          'Delta= ' + this.y + '%<br>' +
          'Expected Delta= ' + this.point.exp + '%<br>' +
          metric.get('name') + '= ' + this.point.metric + metric.get('unit_type') + '<br>' +
          'Overall= ' + this.point.rfinal + '%<br>' +
          'Size = ' + this.point.size;
        }
      },
      xAxis: {
        title: {
          text: "Size of segment"
        }
      },
      yAxis: {
        title: {
          text: "Percent +/- from Avg"
        },
        labels: {
          labels: {
            format: ('{value}%')
          }
        }
      },
      title: {
        useHTML: true,
        text: '<h3>' + group.name +'</h3>'
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          marker: {
            states: {
              select: {
                fillColor: 'blue',
                lineWidth: 0,
                radius: 10
              }
            },
            radius: 6
          },
          point: {
            events: {
              select: function () {
                _this.togglePoint(this);
              },
              unselect: function () {
                _this.togglePoint(this);
              }
            }
          },
          dataLabels: {
            enabled: true,
            formatter:function() {
              return this.point.name.substring(0, 10).concat("...");
            },
            style:{color:"black"}
          }
        }
      },
      series: [{
        color: "red",
        name: "Underperformers",
        data: underperfs
      }, {
        color: "green",
        name: "Overperformers",
        data: overperfs
      }, {
        color: "grey",
        name: "Normal",
        data: regulars
      }]
    };
  }.property('group.facets.@each'),
  expectedChart: function() {
    var group = this.get('group');
    var metric = this.get('schemaFilter.metric');
    var facets = group.facets;

    var delta = [];
    var expected = [];
    var vs = [];
    for (var i = 0; i < facets.length; i++) {
      var insight = facets[i];
      if (insight.v === '~Other~') {
        continue;
      }
      vs.push(insight.v);
      var pt = {
        y: Number(Number(insight.kdelta).toFixed(2)),
        size: insight.insight.scores.total,
        metric: Number(insight.insight.get('scores.final')).toFixed(2),
        exp: Number(insight.edelta).toFixed(2),
        rfinal: Number(insight.rfinal).toFixed(2),
        name: insight.v
      };
      var ept = {
        y: Number(Number(insight.edelta).toFixed(2)),
        size: insight.insight.scores.total,
        metric: Number(insight.rfinal).toFixed(2),
        exp: Number(insight.edelta).toFixed(2),
        rfinal: Number(insight.rfinal).toFixed(2),
        name: insight.v
      };
      delta.push(pt);
      expected.push(ept);
    }
    var _this = this;
    var c = {
      chart: {
        type: 'column',
        zoomType: 'xy'
      },
      //subtitle: {text: group.key},
      tooltip: {
        formatter: function () {
          return '<b>' + this.point.name + '</b><br>' +
            'Delta= ' + this.y + '%<br>' +
            'Expected Delta= ' + this.point.exp + '%<br>' +
            metric.get('name') + '= ' + this.point.metric + metric.get('unit_type') + '<br>' +
            'Overall= ' + this.point.rfinal + '%<br>' +
            'Size = ' + this.point.size;
        }
      },
      xAxis: {
        type: "category",
        categories: vs,
        title: {
          text: "Segments"
        }
      },
      yAxis: {
        title: {
          text: "Percent +/- from Avg"
        },
        labels: {
          labels: {
            format: ('{value}%')
          }
        }
      },
      title: {
        useHTML: true,
        text: '<h3>' + group.name +'</h3>'
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          point: {
            events: {
              select: function () {
                _this.togglePoint(this);
              },
              unselect: function () {
                _this.togglePoint(this);
              }
            }
          },
          dataLabels: {
            enabled: true,
            formatter:function() {
              return this.point.name;
            },
            style:{color:"black"}
          }
        }
      },
      series: [{
        name: "Delta",
        data: delta
      }, {
        name: "Expected Delta",
        data: expected
      }]
    };
    return c;
  }.property('group.facets.@each'),
  setfacets: function() {
    var fs = this.get('group.facets');
    var sm = this.get('showMore');
    for (var i = 0; i < fs.length; i++) {
      fs[i].insight.set('hidden', fs[i].more && !sm);
    }
  }.observes('group.facets', 'showMore').on('init'),
  actions: {
    showMore: function() {
      this.set('showMore', !this.get('showMore'));
    },
    clickInsight: function (insight) {
      this.transitionToRoute('insight', insight.id);
    },
    saveInsight: function(insight) {
      insight.toggleSave();
    },
    toggleFacet: function(facet) {
      this.select(facet);
    },
    selectFactor: function(id) {
      this.get('schemaFilter').selectFactorIds([id], true);
    },
    removeFactor: function(id) {
      this.get('schemaFilter').removeFactorIds([id], true);
    },
    selectFacet: function(g, v) {
      var sf = this.get('schemaFilter');
      var f = sf.findFacet(g, v);
      sf.selectFacets([f], true);
    },
    removeFacet: function(g, v) {
      var sf = this.get('schemaFilter');
      var f = sf.findFacet(g, v);
      sf.removeFacets([f], true);
    },
    show: function(type) {
      this.set('show', type);
    }
  }
});

