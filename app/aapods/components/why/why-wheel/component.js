import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['highcharts', 'funnel'],
  tagName: 'div',

  getConfig: function () {
    var _this = this;
    let series = this.get("data")["data"];
    let height = 300;
    if(this.get("height")){
      height = this.get("height");
    }
    if( series.length>5 && series.filter(function(one_element){return one_element['name']=='Others'}).length<1 ) {
      series.push({
                      name: 'Others',
                      y: 0.001,
                      dataLabels: {
                          enabled: false
                      }
                  });
    }
    var configs = {exporting: { enabled: false },
    credits: {
      enabled: false
  },
    legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            floating: true,
            backgroundColor: '#FFFFFF'
        },
      chart: {
        height: height,
     margin: [10, 10, 10, 10],
            spacingTop: 0,
            spacingBottom: 0,
            spacingLeft: 0,
            spacingRight: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        title: {
            text: '',
            align: 'center',
            verticalAlign: 'middle',
            y: 50
        },
        tooltip: {
            useHTML: true,
            pointFormat: 'Click to explore'
        },
        plotOptions: {
            series: {
              cursor: 'pointer',
                    point: {
                        events: {
                            click: function() {
                                _this.sendAction('clickpie', this);
                                return false;
                            },
                            mouseOver: function(){
                                _this.sendAction('highlight', this);
                                //this.setVisible(false);
                                return false;
                            }
                        }
                    }
                },
            pie: {
                size:'90%',
                 enabled: true,
                    dataLabels: {
            enabled: true,
            color: "gray",
            maxStaggerLines:1,
            useHTML: true,
            format: '{point.name}<h5>{point.percentage:.1f} % </h5>',
            style: {width:'100px'}
        }
            }
        },
        series: [{
            type: 'pie',

            name: 'Root Cause Score',
            innerSize: '50%',
            data: series
        }]
    }
    if (this.get('config')) {
      Ember.merge(configs, this.get('config'));
      if (configs.isDate) {
        configs.rangeSelector = {selected: 0}
      }
    }
    return configs;
  },
  redrawChart: function () {
    this.addCustomLabels();
    var config = this.getConfig();
    if (this.$()) {
      if (config.isDate) {
        this.$().highcharts('StockChart', config);
      } else {
        this.$().highcharts(config);
      }
    }

  }.observes('data', 'type', 'config'),

  addCustomLabels: function () {
    Highcharts.dateFormats = {
      W: function (timestamp) {
        return moment(timestamp).add(1, 'week').isoWeek();
      }
    }
  },

  didInsertElement: function () {
    this.addCustomLabels();
    var config = this.getConfig();
    if (config.isDate) {
      this.$().highcharts('StockChart', config);
    } else {
      this.$().highcharts(config);
    }
  }
})
;

