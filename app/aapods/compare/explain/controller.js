import Ember from 'ember';
import ENV from 'datasenseui/config/environment';
import WhyController from '../../apps/mixin';
import _getids from 'datasenseui/utils/common-util';
import {_dims, _filter, _filter2, _metrics, _groups} from 'datasenseui/utils/why-utils';

export default Ember.Controller.extend(WhyController, {
  stat_sig_level: null,
  targetRoute: "compare.explain",
  showModal: 'controllers.application.showModal',
  type: 'change',
  storyMetrics: Ember.inject.service("story-metrics"),
  sortchoice: 'combo',
  isEditFactor: false,
  isDebug: false,
  isSegFunnel: false,
  factor: null,
  result_tab: null,
  mHighlights: null,
  showHidden: false,
  showHiddenMetrics: false,
  selSort: {"name": "Contribution Diff", "key": "contribdiff"},
  currStory: function () {
    return this.getStoryObj();
  }.property("model", "selSort"),
  sorts: [{"name": "Cuberon Score", "key": "combo"},
    {"name": "Contribution", "key": "contribdiff"},
    {"name": "A/B Test Score", "key": "combo_ab"},
    {"name": "Metric Diff", "key": "mdiff"},
    {"name": "Me vs Rest", "key": "mevsrest"},
    {"name": "Stat Significance", "key": "pvalue"},
    {"name": "Impact", "key": "impactperc"},
    {"name": "Most Unexpected", "key": "combo_normal_contrib"},
    {"name": "Historical Anamoly", "key": "combo_zscore"},
    {"name": "Record Breakers", "key": "combo_zscore_delta"}
  ],
  getStoryObj: function () {
    let cparams = this.get('model.params');
    let story = {};
    story.dataset_id = this.get("model.dataset_id");
    story.metric_id = cparams.metric_id;
    story.factor_id = cparams.factor_id;
    story.fltr = cparams.fltr;
    story.sd = cparams.sd;
    story.ed = cparams.ed;
    story.a = cparams.a;
    story.b = cparams.b;
    story.abucket = this.get('model.results.apt');
    story.bbucket = this.get('model.results.bpt');
    story.metricHash = this.get("metricHash");
    story.sort = this.get("selSort");
    return story;
  },
  sortChoices: [{name: "Cuberon Score", id: 'combo'},
    {name: "Percentage Share", id: 'contribdiff'},
    {name: "Winners and Losers", id: "combo_ab"},
    {name: "Most Unexpected", id: "combo_normal_contrib"},
    {name: "Historical Anamoly", id: "combo_zscore"},
    {name: "Record Breakers", id: "combo_zscore_delta"}],
  currGroup: function () {
    return this.get("dimGroups")[0];
  }.property("dimGroups"),
  dimGroups: function () {
    //create a group called summary
    let summaryGrp = {};
    summaryGrp["name"] = "Summary";
    summaryGrp["metrics"] = Ember.A([]);

    let alldims = this.get("all_dims");
    alldims.slice(0, 5).forEach(function (val) {
      summaryGrp["metrics"].push({"id": val.object.factor.id, "text": val.name});
    });
    let grps = [summaryGrp];
    let allgrps = _groups(this.get("model.dimensions"));
    let smallergrps = [];
    allgrps.forEach(function (val) {
      val.metrics = val.metrics.splice(0, 5);
      smallergrps.push(val);
    });
    grps = grps.concat(smallergrps);
    return grps;
  }.property("model.dimensions"),
  dimHash: function () {
    let res = {};
    let dims = this.get("model.dimensions");
    dims.forEach(function (val) {
      res[val.id] = val;
    });
    return res;
  }.property("model.dimensions"),
  metricHash: function () {
    let res = {};
    let dims = this.get("model.metrics");
    dims.forEach(function (val) {
      res[val.id] = val;
    });
    return res;
  }.property("model.metrics"),
  filterPts: function () {
    let config = {
      significantOnly: this.get("significantOnly"),
      sameDirectionOnly: this.get("sameDirectionOnly")
    };
    return _filter(this.get('pts'), this.get('dim'), config);
  }.property("pts", "sameDirectionOnly", "significantOnly"),
  winner_dims: function () {
    return _dims(_filter2(this.get("filterPts"), true), this.get("dimHash"));
  }.property("pts", "sameDirectionOnly", "show_significance_check_box"),
  looser_dims: function () {
    return _dims(_filter2(this.get("filterPts"), false), this.get("dimHash"));
  }.property("pts", "sameDirectionOnly", "show_significance_check_box"),
  dims_from_data_table: function () {
    return _dims(this.get("filterPts"), this.get("dimHash"));
  }.property("filterPts", "pts", "sameDirectionOnly", "show_significance_check_box"),
  all_dims: function () {
    return _dims(this.get("filterPts"), this.get("dimHash"), 1000);
  }.property("filterPts", "pts", "sameDirectionOnly", "show_significance_check_box"),
  filterSearch: function () {
    let significantOnly = this.get('significantOnly');
    let sameDirectionOnly = this.get('sameDirectionOnly');
    let dim = this.get('dim');
    let filters = [];
    if (dim) {
      filters.push({col: "#significantcol", filter: ""});
      filters.push({col: "#contributorcol", filter: ""});
      return filters;
    }
    if (significantOnly) {
      filters.push({col: "#significantcol", filter: "true"});
    } else {
      filters.push({col: "#significantcol", filter: ""});
    }

    if (sameDirectionOnly) {
      filters.push({col: "#contributorcol", filter: "true"});
    } else {
      filters.push({col: "#contributorcol", filter: ""});
    }
    return filters;
  }.property('sameDirectionOnly', 'significantOnly', 'dim'),

  sameDirectionOnly: function () {
    let datasetid = this.get('model.dataset_id');

    return this.get("result_tab") !== "optimize" && this.get("result_tab") !== "groups" &&
      datasetid !== 'caviar_eb' && datasetid !== 'nvidia';

  }.property("result_tab"),
  significantOnly: function () {
    let datasetid = this.get('model.dataset_id');
    return this.get('statsig_only') || (datasetid !== 'caviar_eb' && datasetid !== 'nvidia' && this.get("result_tab") !== "optimize");
  }.property("result_tab", 'statsig_only'),
  selectedFactorsOnly: true,
  metricpie: function () {
    return _metrics(this.get('model.results.otherdiff'));
  }.property('model.results.otherdiff'),
  dimensionpie2: function () {
    let pieinfo = {};
    if (this.get("factor")) {
      let results = this.get("filterPts");
      let data = [];
      let count = 5;
      results.forEach(function (val) {
        if (count) {
          count -= 1;
          let tuple = {};
          tuple["name"] = val.facet.n;
          tuple["y"] = Math.abs(val.facet.combo);
          tuple["object"] = val;
          data.push(tuple);
        }
      });
      pieinfo["data"] = data;
      pieinfo["back"] = true;
    } else {
      // pieinfo["data"] = this.rankedDims(this.get('factorpts'), this.get('groupValsByDim'), 5, 2);
      pieinfo["data"] = this.get("dims_from_data_table");
      pieinfo["back"] = false;
    }
    return pieinfo;
  }.property('pts', 'factor', 'sameDirectionOnly', 'significantOnly'),
  breadcrumb: function () {
    let path = this.get("model.results.displaystr");
    let breadcrumb = null;
    if (path) {
      breadcrumb = [];
      breadcrumb.push({
        "name": "Overall",
        "fltr": ""
      });

      for (let i = 0; i < path.length; i++) {

        if (i > 0) {
          breadcrumb.push({
            "name": path[i].name + ":" + path[i].value,
            "fltr": breadcrumb[i]['fltr'] + ";" + path[i].id + "==" + path[i].value
          });
        }
        else {
          breadcrumb.push({
            "name": path[i].name + ":" + path[i].value,
            "fltr": path[i].id + "==" + path[i].value
          });
        }
      }

      breadcrumb[breadcrumb.length - 1]["class"] = "active";
    }
    return breadcrumb;
  }.property('model.results.displaystr'),

  facets: Ember.computed.readOnly('model.results.facets'),
  answer: Ember.computed.readOnly('model.results.answer'),
  fmetrics: Ember.computed.readOnly('model.results.otherdiff'),
  cluster: Ember.computed.readOnly('model.results.cluster'),


  dosort: function () {
    let sc = this.get('model.params.sort');
    let s = this.get('sortchoice');
    if (sc !== s) {
      var cparams = this.get('model.params');
      cparams.sort = s;
      this.transitionToRoute('compare.explain', {
          queryParams: cparams
        }
      );
    }
  }.observes('sortchoice'),
  setupDim: function () {
    let dim = this.get('dim');
    let f = this.get('factor');
    if (f && dim === f.id) {
      return;
    }
    if (f) {
      dim = f.id;
    } else {
      dim = null;
    }
    var cparams = this.get('model.params');
    cparams.dim = dim;
    this.transitionToRoute('compare.explain', {
        queryParams: cparams
      }
    );
  }.observes('factor'),
  setupFactor: function () {
    let dim = this.get('dim');
    let f = this.get('factor');
    if (f && dim === f.id) {
      return;
    }
    if (!dim) {
      this.set('factor', null);
      return;
    }
    let fs = this.get('model.results');
    if (!fs || !fs.factors) {
      return;
    }
    for (let i = 0; i < fs.factors.length; i++) {
      if (fs.factors[i].id === dim) {
        this.set('factor', fs.factors[i]);
        return;
      }
    }
  }.observes('model.results').on('init'),
  deeper: function (facet) {
    this.send('deeperwhy', facet);
  },
  selectDims: function () {
    let selectDims = this.get("sel_dimension_ids");
    if (!selectDims) {
      selectDims = this.get("model.compare").get("dimensions");
      let sdimids = [];
      selectDims.forEach(function (val) {
        sdimids.push(val.id);
      });
      selectDims = sdimids;
    }
    return selectDims;
  }.property('sel_dimension_ids', 'model.compare.dimensions'),
  selectMetrics: function () {
    let selectMetrics = this.get("sel_metric_ids");
    if (!selectMetrics) {
      selectMetrics = this.get("model.metrics");
      let smetricids = [];
      selectMetrics.forEach(function (val) {
        smetricids.push(val.id);
      });
      selectMetrics = smetricids;
    }
    return selectMetrics;
  }.property('sel_metric_ids', 'model.compare.metrics'),
  pts: function () {
    let facets = this.get('facets');
    let dim = this.get('dim');
    if (!facets) {
      return [];
    }

    let show = 'combo';

    let pts = Ember.A([]);
    let dataset_id = this.get('model.dataset_id');
    for (let i = 0; i < facets.length; i++) {
      if (!this.get("showHidden") && this.get('selectDims').indexOf(facets[i].f) === -1 && !dim) {
        console.log("hiding " + facets[i].fname + ":" + facets[i].n);
        continue;
      }
      let name = facets[i].n;
      if (!dim) {
        name = facets[i].fname + ": " + facets[i].n;
      }
      let isWinner = null;
      if (dataset_id === 'caviar_eb' || dataset_id === 'nvidia' || dataset_id === 'whoeasy') {
        isWinner = facets[i].contribdiff > 0;
      } else {
        isWinner = facets[i].pm > this.get("model").results.d.pm;
      }

      pts.push(Ember.Object.create({
        y: Number(facets[i][show].toFixed(2)),
        name: name,
        facet: facets[i],
        // color: color,
        // labelcolor: labelcolor,
        // contribcolor: contribcolor,
        // metriccolor: metriccolor,
        // denomcolor: denomcolor,
        // numercolor: numercolor,
        // restcolor: restcolor,
        // mevsrestcolor: mevsrestcolor,
        // vsnochangecolor: vsnochangecolor,
        score: Math.abs(facets[i][show]),
        isWinner: isWinner
      }));
      //if (pts.length >= 10) {
      //  break;
      //}
    }
    return pts;
  }.property('facets', 'selectDims', 'showHidden'),
  funnelpts: function () {
    let pts = Ember.A([]);
    let funnelmetrics = this.get("fmetrics");
    for (let i = 0; i < funnelmetrics.length; i++) {

      if (!this.get("showHiddenMetrics") && this.get('selectMetrics').indexOf(funnelmetrics[i].metricid) === -1) {
        console.log("hiding " + funnelmetrics[i].name);
        continue;
      }
      pts.push(Ember.Object.create({
        metric: funnelmetrics[i]
      }));
    }
    return pts;
  }.property('funnelmetrics', 'selectMetrics', 'showHiddenMetrics'),
  factorpts: function () {
    let factors = this.get('model.results.factors');

    if (!factors) {
      return [];
    }
    let show = this.get('sort');
    if (!show) {
      show = 'combo';
    }
    let pts = [];
    for (let i = 0; i < factors.length; i++) {
      if (!this.get("showHidden") && this.get('selectDims').indexOf(factors[i].id) === -1) {
        console.log("hiding " + factors[i].name);
        continue;
      }
      let name = factors[i].name;
      pts.push({
        y: Number(factors[i][show].toFixed(2)),
        name: name,
        factor: factors[i]
      });
    }
    return pts;
  }.property('model.results.factors', 'selectDims', 'showHidden'),
  changeStatSig: function () {
    let statSig = this.get('statSig');
    var cparams = this.get('model.params');
    cparams.stat_sig_level = statSig;
    this.transitionToRoute('compare.explain', {
        queryParams: cparams
      }
    );
  }.observes("statSig"),
  chart: function () {
    let show = this.get('sort');
    if (!show) {
      show = 'combo';
    }
    let a = this.get('a');
    let b = this.get('b');
    let compare = this.get('model');
    let munit = compare.metric.get('unitType');
    if (!munit) {
      munit = '';
    }

    let denom = compare.metric.get('calculation.denominator');
    let numer = compare.metric.get('calculation.numerator');
    let numUnit = '';
    if (numer && numer.unit_type) {
      numUnit = numer.unit_type;
    }
    let denomUnit = '';
    if (denom && denom.unit_type) {
      denomUnit = denom.unit_type;
    }

    let sortname = 'Top  Segments';
    let yunit = '%';
    if (show === 'impactperc') {
      sortname = 'Segments with the most Impact';
      yunit = '%';
    } else if (show === 'contribdiff') {
      sortname = 'Segments with highest change in Contribution';
      yunit = '%';
    } else if (show === 'combo') {
      sortname = 'Segments with the highest Cuberon Score';
      yunit = '';
    }


    let pts = this.get('pts');
    if (pts && pts.length > 10) {
      pts = pts.slice(0, 10);
    }
    let ht = pts.length * 40 + 80;
    var self = this;
    return {
      title: {
        text: ''
      },
      chart: {type: 'bar', zoomType: "xy", height: ht},

      tooltip: {
        useHTML: true,
        percentageDecimals: 2,
        followPointer: true,
        backgroundColor: "rgba(255,255,255,1)",
        formatter: function () {
          let dhtml = '';
          let nhtml = '';
          if (denom) {
            dhtml =
              '<tr>' +
              '<td>' + denom.name + '</td>' +
              '<td>' + this.point.facet.facet_data.a.ct.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>' +
              '<td>' + this.point.facet.facet_data.b.ct.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>' +
              '<td class="' + this.point.denomcolor + '">' +
              this.point.facet.ddiff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
              denomUnit + '</td>' +
              '</tr>';
          }
          if (numer) {
            nhtml =
              '<tr>' +
              '<td>' + numer.name + '</td>' +
              '<td>' + this.point.facet.facet_data.a.mct.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>' +
              '<td>' + this.point.facet.facet_data.b.mct.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>' +
              '<td class="' + this.point.numercolor + '">' +
              this.point.facet.netdiff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
              numUnit + '</td>' +
              '</tr>';
          }
          const tt = '<div>' +
            '<div class=text-center"><strong>' + this.point.name + '</strong><br> Caused <strong class="' +
            this.point.vsnochangecolor + '">' +
            this.point.facet.vsnochange.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '%</strong> impact' +
            '</div><br><table class="table">' +
            '<thead>' +
            '<tr>' +
            '<th></th>' +
            '<th>' + a + '</th>' +
            '<th>' + b + '</th>' +
            '<th>Change</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' +
            '<tr>' +
            '<td>Contribution</td>' +
            '<td>' + this.point.facet.facet_data.a.pmct.toFixed(2) + '%</td>' +
            '<td>' + this.point.facet.facet_data.b.pmct.toFixed(2) + '%</td>' +
            '<td class="' + this.point.contribcolor + '">' + this.point.facet.contribdiff.toFixed(2) + '%</td>' +
            '</tr>' +

            '<tr>' +
            '<td>' + compare.metric.get('name') + '</td>' +
            '<td>' + this.point.facet.facet_data.a.om.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + munit + '</td>' +
            '<td>' + this.point.facet.facet_data.b.om.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + munit + '</td>' +
            '<td class="' + this.point.metriccolor + '">' +
            this.point.facet.odiff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + munit + '</td>' +
            '</tr>' + nhtml + dhtml +

            '</tbody>' +
            '</table>' +
            //'<a href=""><b>Why</b></a> <br> ' +
            //'<span class="glyphicon glyphicon-ban-circle"></span> <a href=""><b>Hide</b></b> ' +
            //this.point.facet.fname + '</a> <br> ' +
            //'<span class="glyphicon glyphicon-ban-circle"></span> <a href=""><b>Hide</b> ' +
            //this.point.facet.fname + '=' + this.point.facet.n + '</a>' +
            '</div>';
          return tt;
        }
      },
      xAxis: {
        type: 'category',
        title: {
          enabled: false,
          text: "Top Segments"
        },
        labels: {
          enabled: true,
          step: 1,
          style: {"font-style": "italic", "font-size": "14px", "font-family": ''},
          formatter: function () {
            var text = this.value,
              formatted = text.length > 40 ? text.substring(0, 40) + '...' : text;
            return '<span title="' + text + '">' + formatted + '</span>';
          },
          useHTML: true
        },
        gridLineWidth: 1,
        lineWidth: 0
      },
      yAxis: {
        title: {
          text: "<b>" + sortname + "</b>"
        },
        labels: {
          enabled: false,
          format: ('{value}%')
        },
        opposite: true,
        gridLineWidth: 0
        //tickPositioner: function () {
        //  var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
        //  var halfMaxDeviation = Math.ceil(maxDeviation / 2);
        //  return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation];
        //}
      },
      series: [{name: "default", data: pts}],
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                self.deeper(this.facet);
              }
            }
          }
        },
        bar: {
          dataLabels: {
            enabled: true,
            useHTML: true,
            formatter: function () {
              return '<span class="whychartlabel ' + this.point.labelcolor + '"><strong> ' + this.y + yunit + " </strong></span>";
            },
            crop: false,
            overflow: 'none'
          }
        }
      }
    };
  }.property('pts'),
  //WHY IS HERE
  init: function () {
    Ember.run.schedule("afterRender", this, function () {
      $('.btn-compare').tooltip({delay: 200});
    });
  },

  //DONE
  advancedSearchContent: [{id: "asd", val: "asd"}],
  breadCrumb: function () {
    return this.get("model.results.fltr");
  }.property("model.results.fltr"),
  metricCount: function () {
    return this.get("model.metrics").get("length");
  }.property("model.metrics"),
  dimsearch: null,
  follows: function () {
    let alldims = this.get('alldims');
    let following = Ember.A([]);
    let notfollowing = Ember.A([]);
    let search = this.get('dimsearch');

    alldims.forEach(function (dim) {
      if (!search || dim.get('name').toLowerCase().indexOf(search.toLowerCase()) >= 0) {
        if (dim.get('following')) {
          following.pushObject(dim);
        } else {
          notfollowing.pushObject(dim);
        }
      }
    });
    following.pushObjects(notfollowing);
    return following;
  }.property('alldims.@each.following', 'dimsearch'),
  alldims: function () {
    let dims = this.get('model.dimensions'); //list of all dimensions
    let foll = this.get('model.compare.dimensions'); //list of dimensions selected
    if (!foll) {
      foll = dims; //list of default dimensions
    }
    let ret = Ember.A([]);
    if (!dims) {
      return ret;
    }
    dims.forEach(function (dim) {
      let found = false;
      if (foll && foll.length > 0) {
        found = foll.findBy('id', dim.get('id'));
      }
      ret.pushObject(Ember.ObjectProxy.create({
        content: dim.toJSON({includeId: true}),
        following: found
      }));
    });
    return ret.sortBy('name'); //all dimensions annotated with which ones are being followed
  }.property('model.dimensions'),
  mainChartObj: function () {

    let sd = this.get('sd');
    let ed = this.get('ed');

    if (!sd) {
      sd = this.get('model.window.startDate');
    }
    if (!ed) {
      ed = this.get('model.window.endDate');
    }
    let chartobj = {
      dataset: this.get('model.dataset'),
      selectedMetricId: this.get('metric_id'),
      selectedDimensionId: this.get('factor_id'),
      startDate: sd,
      endDate: ed,
      dashboard: this.get('model.dashboard'),
      metrics: this.get('model.metrics'),
      preColorA: this.get('model.results.apt.bucket'),
      preColorB: this.get('model.results.bpt.bucket'),
      f: this.get('fltr'),
      spark_only: false
    };
    let isDate = this.get('model.results.isdate');
    if (isDate) {
      chartobj.type = 'line';
    } else {
      chartobj.type = 'column';
    }
    return chartobj;
  }.property('model.dataset', 'metric_id', 'factor_id', 'model.window', 'fltr'),
  actions: {
    exploreSessionsOld: function (point) {
      const modal = {
        dataset_id: this.get("model.dataset_id"),
        filters: this.getFilterForPoint(point) + ';' + this.get('model.params').b,
        name: point.name
      };
      this.send("showModal", "session-modal", modal);
    },
    follow: function () {

    },
    modalForMainChart: function (modal, data) {
      this.send('showModal', modal, data);
    },

    modalForMetric: function (metricid) {
      let cparams = this.get('model.params');
      let chartobj = {
        dataset: this.get('model.dataset'),
        selectedMetricId: metricid,
        selectedDimensionId: cparams.factor_id,
        startDate: this.get('model.window.startDate'),
        endDate: this.get('model.window.endDate'),
        dashboard: this.get('model.dashboard'),
        modalTitle: "Metric Over Time",
        metrics: this.get('model.metrics'),
        preColorA: this.get('model.results.apt.bucket'),
        preColorB: this.get('model.results.bpt.bucket'),
        f: this.get('fltr'),
        spark_only: false
      };
      let isDate = this.get('model.results.isdate');
      if (isDate) {
        chartobj.type = 'line';
      } else {
        chartobj.type = 'column';
      }
      this.send('showModal', 'simple-chart', chartobj);
    },
    updateCompare: function () {
      let alldims = this.get('alldims');
      let following = Ember.A([]);
      alldims.forEach(function (dim) {
        if (dim.get('following')) {
          following.pushObject(dim.get('id'));
        }
      });
      this.set('sel_dimension_ids', following);
    },
    saveCompare: function () {
      let alldims = this.get('alldims');
      let following = Ember.A([]);
      alldims.forEach(function (dim) {
        if (dim.get('following')) {
          following.pushObject(dim.content);
        }
      });
      let com = this.get('model.compare');
      let currdims = com.get('dimensions');

      if (currdims.length === following.length) {
        let currset = new Set();

        for (let i = 0; i < currdims.length; i++) {
          currset.add(currdims[i].id);
        }
        let same = true;
        for (let i = 0; i < following.length; i++) {
          if (!currset.has(following[i].id)) {
            same = false;
            break;
          }
        }
        if (same) {
          return;
        }
      }

      com.set('dimensions', following);

      var onSuccess = function () {
      };
      var onFail = function (error) {
        console.log(error);
      };
      com.save().then(onSuccess, onFail);
    },
    setPoint: function (type, value) {
      if (type === 'a') {
        this.set('a', value);
      }
      if (type === 'b') {
        this.set('b', value);
      }
    },
    // bookmark: function () {
    //   var story_object = this.get("story_object");
    //   if (story_object) {
    //     var _this = this;
    //     story_object.destroyRecord().then(function () {
    //       _this.set("story_object", null);
    //     });
    //   } else {
    //     let title = this.get("model.metric.name") + "-" + this.get('model.factor.name') + "-" + this.get('model.results.fltr') + "-" + this.get('model.results.bpt.name') + "-" + this.get('model.results.apt.name');
    //     var url = window.location.href;
    //     var record = this.store.createRecord('story', {
    //       datasetId: this.get("model.dataset_id"),
    //       compareUrl: url,
    //       title: title,
    //       stype: "bookmark"
    //     });
    //     record.save();
    //     this.set("story_object", record);
    //   }
    // },
    mclick: function (id) {
      this.transitionToRoute('compare.explain', {
        queryParams: {
          'metric_id': id,
          a: this.get('a'),
          b: this.get('b'),
          fltr: this.get('fltr'),
          factor_id: this.get('factor_id'),
          sd: this.get('sd'),
          ed: this.get('ed'),
          dim: null
        }
      });
    },
    setAdvancedSearchChoices: function () {

    },
    metric_change: function (component, id) {
//      this.set('qsm', this.get('model.metrics').findBy('id', id));
      this.transitionToRoute('compare.explain', {
        queryParams: {
          'metric_id': id,
          a: this.get('a'),
          b: this.get('b'),
          fltr: this.get('fltr'),
          factor_id: this.get('factor_id'),
          sd: this.get('sd'),
          ed: this.get('ed'),
          dim: null
        }
      });
    },
    done: function () {
      this.send("reload");
    },
    cancel: function () {
      Ember.$("#adhoc-message").hide();
    },
    toggleEditGroup: function () {
      this.toggleProperty('isEditGroup');
    },
    toggleEdit: function () {
      this.toggleProperty('isEditFactor');
    },
    toggleFunnel: function () {
      this.toggleProperty('isSegFunnel');
    },
    editFactor: function (object) {
      let factor = null;
      if (object && object.facet) {
        let pos = this.get("model.dimensions").map(function (e) {
          return e.id;
        }).indexOf(object.facet.f);
        factor = this.get("model.dimensions").objectAt(pos);
      }
      if (object && object.metric) {
        let pos = this.get("model.metrics").map(function (e) {
          return e.id;
        }).indexOf(object.metric.metricid);
        factor = this.get("model.metrics").objectAt(pos);
      }
      if (factor) {
        this.set("currFactor", factor);
        this.toggleProperty('isEditFactor');
      }
    },
    breadcrumbClk: function (bc) {
      var cparams = this.get('model.params');
      cparams.fltr = bc.fltr;
      cparams.dim = null;
      this.transitionToRoute('compare.explain', {
          queryParams: cparams
        }
      );
    },
    metricwhy: function (id) {
      var cparams = this.getParams();
      this.transitionToRoute('compare.explain', {
        queryParams: {
          metric_id: id,
          a: cparams.a,
          b: cparams.b,
          fltr: cparams.fltr,
          factor_id: cparams.factor_id,
          sd: cparams.sd,
          ed: cparams.ed,
          dim: null
        }
      });
    },

    deeperwhy: function (point) {
      var fltr = this.getFilterForPoint(point);
      var _this = this;
      var cparams = this.getParams();
      var dataset_id = this.get('model').dataset_id;
      //  cparams.sort = _this.get('sort');
      //  cparams.fltr = fltr;
      point.set('loading', true);
      Ember.$.get(ENV.api_endpoint + '/pattern/whyStatus/', {
        dataset_id: dataset_id,
        metric_id: cparams.metric_id,
        factor_id: cparams.factor_id,
        filter: fltr,
        start_date: cparams.sd,
        end_date: cparams.ed,
        a: cparams.a,
        b: cparams.b
      }).then(function (data) {
          if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
            point.set('loading', false);
            data['metric_id'] = cparams.metric_id;
            data['a'] = cparams.a;
            data['b'] = cparams.b;
            data['fltr'] = fltr;
            data['factor_id'] = cparams.factor_id;
            data['sd'] = cparams.sd;
            data['ed'] = cparams.ed;
            data['dataset_id'] = dataset_id;
            if (data['percent'] >= 90.0) {
              //redirect to compare.explain
              _this.transitionToRoute('compare.explain', {
                queryParams: {
                  'metric_id': cparams.metric_id,
                  a: cparams.a,
                  b: cparams.b,
                  fltr: fltr,
                  factor_id: cparams.factor_id,
                  sd: cparams.sd,
                  ed: cparams.ed,
                  dim: null
                }
              });
            }
            else {
              //show modal
              if (data['adhocwhy_exist'] === 1) {
                _this.send("showModal", "adhocwhyexists-modal", data);
              }
              else {
                if (data['requests'] <= 0) {
                  _this.send("showModal", "adhocwhyexceeded-modal", data);
                }
                else {
                  _this.send("showModal", "adhocwhy-modal", data);
                }
              }

            }

          }
        }, function (error) {
          point.set('loading', false);
          console.log(error);
        }
      );
    },
    highlight: function () {
      this.set("mHighlights", ["a"]);
    },
    clickpie: function (factor) {
      if (factor.object.factor) {
        this.set("factor", factor.object.factor);
      }
      if (factor.object.facet) {
        Ember.$('html, body').animate({scrollTop: $("#" + factor.object.facet.n).offset().top - 400}, 1000);
        Ember.$("#" + factor.object.facet.n).stop().css("background-color", "#FFFF9C").animate({backgroundColor: rgb(252, 188, 38)}, 1500);
        //Ember.$("#"+factor.object.facet.n).effect("pulsate", { times:3 }, 2000);
        //Ember.$("#"+factor.object.facet.n).toggle( "highlight" );

      }
    },
    jumptosegmentrow: function (facet) {
      if (facet) {
        let selector = "[id='" + facet + "']";
        Ember.$('html, body').animate({scrollTop: $(selector).offset().top - 400}, 1000);
        Ember.$(selector).stop().css("background-color", "#FFFF9C").animate({backgroundColor: rgb(252, 188, 38)}, 1500);
      }
    },
    setdim: function (factor) {
      this.set("factor", factor);
    },
    deletedim: function (dim) {
      let currDims = this.get("selectDims");
      let newDims = [];
      currDims.forEach(function (val) {
        if (val !== dim) {
          newDims.push(val);
        }
      });
      //this will automatically update the select dims
      this.set("sel_dimension_ids", newDims);
      this.send("reload");
    },
    whyfunnel: function (point) {
      //this.set("currStory", story);
      let story = this.get("currStory");
      story.fltr = this.getFilterForPoint(point);
      let change = this.get("storyMetrics").metrics(story);
      let _this = this;
      change.then(function (change) {
          story.mpie = _metrics(change.otherdiff);
          story.change = change;

          _this.set("currStory", story);
          _this.toggleProperty("isSegFunnel");
        }, function (error) {
          console.log(error);
        }
      );
    },
    deletemetric: function (metric) {
      let currMetrics = this.get("selectMetrics");
      let newMetrics = [];
      currMetrics.forEach(function (val) {
        if (val !== metric.metricid) {
          newMetrics.push(val);
        }
      });
      this.set("sel_metric_ids", newMetrics);
      this.send("reload");
    },
    setCurrGroup: function (group) {
      this.set("currGroup", group);
    },
    modalForContrib: function (pt) {
      let cparams = this.get('model');
      let m = cparams.metric_id;

      let numer = this.get('model.metric.calculation.numerator');
      if (numer) {
        m = numer.id;
      }
      let chartobj = {
        dataset: this.get('model.dataset'),
        selectedMetricId: m,
        selectedDimensionId: cparams.factor_id,
        startDate: this.get('model.window.startDate'),
        endDate: this.get('model.window.endDate'),
        dashboard: this.get('model.dashboard'),
        f: cparams.fltr,
        group_by: pt.facet.f,
        spark_only: false,
        selectedSeries: pt.facet.n,
        preColorA: this.get('model.results.apt.bucket'),
        preColorB: this.get('model.results.bpt.bucket'),
        type: 'area',
        modalTitle: 'Contribution Over Time'
      };
      this.send('showModal', 'simple-chart', chartobj);
    },
    modalForSegment: function (pt) {
      const cparams = this.get('model.params'),
        isDate = this.get('model.results.isdate');

      const chartobj = {
        dataset: this.get('model.dataset'),
        selectedMetricId: cparams.metric_id,
        selectedDimensionId: cparams.factor_id,
        dashboard: this.get('model.dashboard'),
        f: this.getFilterForPoint(pt),
        modalTitle: "Metric Over Time",
        preColorA: this.get('model.results.apt.bucket'),
        preColorB: this.get('model.results.bpt.bucket'),
        spark_only: false
      };

      if (isDate) {
        chartobj.type = 'line';
        chartobj.startDate = this.get('model.window.startDate');
        chartobj.endDate = this.get('model.window.endDate');
      } else {
        chartobj.type = 'column';
        chartobj.startDate = this.get('model.params').sd;
        chartobj.endDate = this.get('model.params').ed;
      }
      this.send('showModal', 'simple-chart', chartobj);
    },
    selectdim: function (factor) {
      let fs = this.get('model.results.factors');
      if (!fs) {
        return;
      }
      for (let i = 0; i < fs.length; i++) {
        if (fs[i].id === factor) {
          this.set('factor', fs[i]);
          return;
        }
      }
    },
    searchDims: function (searchStr) {
      var cparams = this.get('model.params');
      Ember.set(cparams, "search_str", searchStr);
      this.transitionToRoute('compare.explain', {
          queryParams: cparams
        }
      );
    },
    significantFilter: function () {

    },
    directionFilter: function () {

    },
    factorFilter: function () {
    },
    debug: function () {
      this.set('isDebug', !this.get('debug'));
    }
  }
});

