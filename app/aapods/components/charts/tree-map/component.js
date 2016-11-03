import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['highcharts', 'funnel','heatmap','treemap'],
  tagName: 'div',
  getConfig: function () {
    var obj = this.get('data');
    var configs = {
        colorAxis: {
            minColor: ' #d03b53',
            maxColor: '#23c874'
        },
        tooltip: {
            backgroundColor: 'yellow',
            formatter: function () {
                return this.point.name + ":" + this.point.value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        },
        series: [{
            dataLabels: {
                enabled: false
            },
            levelIsConstant: false,
            levels: [{
                level: 1,
                dataLabels: {
                    enabled: true
                },
                borderWidth: 3
            }],

            turboThreshold: 10000,
            type: "treemap",

            allowDrillToNode: true,
            data: obj

        }],
        title: {
            text: 'Highcharts Treemap'
        }
    };
    if (this.get('config')) {
      Ember.merge(configs, this.get('config'));
    }
    return configs;
  },
  redrawChart: function () {
    var config = this.getConfig();
    if (this.$()) {
      this.$().highcharts(config);
    }
  }.observes('data', 'type', 'config'),

  didInsertElement: function () {
    var config = this.getConfig();
    console.log(config);
     if (this.$()) {
      this.$().highcharts(config);
    }
  }.on('init')
});


