import Ember from 'ember';
import {_metrics} from 'datasenseui/utils/why-utils';

export default Ember.Component.extend({
  classNames: ['highcharts', 'funnel'],
  tagName: 'div',

  getConfig: function () {
    var _this = this;
    let series = this.get("data")["data"];
    let xlabels = [];
    series.forEach(function(val){
      xlabels.push(val.name);
    });
    //let xlabels =  this.get("names");
    var configs = 
    {
        exporting: { enabled: false },
        credits: {
            enabled: false
       },
      chart: {
        type: 'column',
        width: 800,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
        },
         xAxis: {
            categories: xlabels,
            labels: {
                rotation: -45,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
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
            column: {
                colorByPoint: true,
                dataLabels: {
                    enabled: true,
                    crop: false,
                    rotation: -90,
                    color: '#FFFFFF',
                    align: 'right',
                    format: '{point.y:.1f}', // one decimal
                    y: 5, // 10 pixels down from the top
                    style: {
                    fontSize: '10px',
                    fontFamily: 'Verdana, sans-serif'
                    },
                    overflow: 'none'
                }
            }
        },
        series: [{
            name: 'Change',
            data: series,
            pointWidth: 20
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