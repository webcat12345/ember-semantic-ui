import Ember from 'ember';
import ENV from 'datasenseui/config/environment';


export default Ember.Controller.extend({

  needs: ["application"],
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),

  plots: Ember.A([]),

  initPlotParams: function() {
    // initialize plot parameters based on dataset_id

    // plotTypes: 'line', 'column', 'bar', 'pie'
    // stackingTypes: null, 'normal', 'percent'

    const dataset_id = this.get('model.dataset_id');

    if (dataset_id === 'thredup_all') {

      this.set(
        'plots',
        Ember.A([
          {
            queryName: 'ConversionByAddToCarts_New',
            title: 'New User Conversions by AddToCarts (Overall)',
            xAxisName: '# AddToCart Events',
            yAxisName: 'Conversion Rate (%)',
            plotType: 'line',
            stackingType: null
          },
          {
            queryName: 'AddToCartsHist_New',
            title: 'New User Sessions by AddToCarts (Overall)',
            xAxisName: '# AddToCart Events',
            yAxisName: '# Sessions',
            plotType: 'column',
            stackingType: null
          },
          {
            queryName: 'ConversionByAddToCarts_New_MobileWeb',
            title: 'New User Conversions by AddToCarts (Mobile Web)',
            xAxisName: '# AddToCart Events',
            yAxisName: 'Conversion Rate (%)',
            plotType: 'line',
            stackingType: null
          },
          {
            queryName: 'AddToCartsHist_New_MobileWeb',
            title: 'New User Sessions by AddToCarts (Mobile Web)',
            xAxisName: '# AddToCart Events',
            yAxisName: '# Sessions',
            plotType: 'column',
            stackingType: null
          },
          {
            queryName: 'ConversionByAddToCarts_Old',
            title: 'Returning User Conversions by AddToCarts (Overall)',
            xAxisName: '# AddToCart Events',
            yAxisName: 'Conversion Rate (%)',
            plotType: 'line',
            stackingType: null
          },
          {
            queryName: 'AddToCartsHist_Old',
            title: 'Returning User Sessions by AddToCarts (Overall)',
            xAxisName: '# AddToCart Events',
            yAxisName: '# Sessions',
            plotType: 'column',
            stackingType: null
          },
          {
            queryName: 'ConversionByAddToCarts_Old_MobileWeb',
            title: 'Returning User Conversions by AddToCarts (Mobile Web)',
            xAxisName: '# AddToCart Events',
            yAxisName: 'Conversion Rate (%)',
            plotType: 'line',
            stackingType: null
          },
          {
            queryName: 'AddToCartsHist_Old_MobileWeb',
            title: 'Returning User Sessions by AddToCarts (Mobile Web)',
            xAxisName: '# AddToCart Events',
            yAxisName: '# Sessions',
            plotType: 'column',
            stackingType: null
          },
        ])
      );
    } else {
      this.set('plots', Ember.A([]));
    }
  },

  queryParams: Ember.A([]),
  startDate: null,
  endDate: null,
  useDateRange: true,

  _initialize: function() {
    console.log('EXECUTING _initialize()');
    this.set('startDate', this.get('model.window.startDate'));
    this.set('endDate', this.get('model.window.endDate'));
    this.initPlotParams();
    this.loadQueryParams();
  },

  initialize: function(params) {
    console.log('EXECUTING initialize()');
    this._initialize();
  },

  reset: function() {
    console.log('EXECUTING reset()');
    this._initialize();
  },

  loadQueryParams: function() {
    // retrieve query params from RESTful API and
    // populate `queryParams`, which is bound to chart components.
    console.log('EXECUTING loadQueryParams()');
    const dataset_id = this.get('model.dataset_id');
    const staticDims = this.get('model.dimensions');
    const plots = this.get('plots');
    const useDateRange = this.get('useDateRange');
    const startDate = this.get('startDate');
    const endDate = this.get('endDate');
    // initialize queryParams
    this.set('queryParams', Ember.A([]));
    const queryParams = this.get('queryParams');
    plots.forEach((plot) => {
      queryParams.addObject({
        complete: false,
        query_id: 'advanced_query',
        queryName: plot.queryName,
        title: plot.title,
        plotType: plot.plotType,
        stackingType: plot.stackingType,
        startDate: useDateRange ? startDate : null,
        endDate: useDateRange ? endDate : null,
        group_by_id: plot.group_by_id,
        group_vals: plot.group_vals ? plot.group_vals.join(',,,') : null,
        // create dummy values to keep everything happy
        m: this.get('model.dashboard.countmetric'),
        d: this.get('model.dashboard.date'),
      });
    });
    plots.forEach((plot) => {
      Ember.$.get(
        ENV.api_endpoint + '/chart/advanced/' + dataset_id + '/params/',
        {name: plot.queryName}
      ).then((params) => {
        if (params) {
          console.log('Loading params for ' + plot.queryName);
          console.log('params: ' + JSON.stringify(params));
          // x-axis name
          let xAxisName = plot.xAxisName;
          if (!xAxisName) {
            const xDim = staticDims.findBy('id', params.x.dim_id);
            if (xDim) {
              xAxisName = xDim.get('name');
            } else {
              if (!(params.x.dim_id in params.dynamic_dims)) {
                throw new Error('Unrecognized dimId: %@'.fmt(params.x.dim_id));
              }
              xAxisName = params.dynamic_dims[params.x.dim_id].name;
            }
          }
          // y-axis name
          let yAxisName = plot.yAxisName;
          if (!yAxisName) {
            yAxisName = params.y.func;
          }
          // update queryParam object
          const queryParam = queryParams.findBy('title', plot.title);
          Ember.set(queryParam, 'xAxisName', xAxisName);
          Ember.set(queryParam, 'yAxisName', yAxisName);
          Ember.set(queryParam, 'filter', params.filter);
          Ember.set(
            queryParam,
            'qp_params',
            {
              dynamic_dims: params.dynamic_dims,
              y: params.y,
              x: params.x,
              limit: params.limit
            }
          );
          Ember.set(queryParam, 'complete', true);
        }
      });
    });
  },

  onDateChange: function() {
    this.loadQueryParams();
  }.observes('startDate', 'endDate', 'useDateRange'),

  actions: {}
});
