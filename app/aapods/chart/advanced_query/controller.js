import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

//
// DYNAMIC FILTER CLASS
//

const DynamicFilter = Ember.Object.extend();

// class (static) properties
DynamicFilter.reopenClass({

  boolValues: [
    {id: 'true', name: 'true'},
    {id: 'false', name: 'false'}
  ],

  conjTypes: [
    {id: 'and', name: 'and', value: ';'},
    {id: 'or', name: 'or', value: ',,'}
  ],

  filterTypes: [
    {id: 'is equal to', name: 'is equal to', value: '==', unary: false},
    {id: 'is NOT equal to', name: 'is NOT equal to', value: '!=', unary: false},
    {id: 'is greater than', name: 'is greater than', value: '>>', unary: false},
    {id: 'is less than', name: 'is less than', value: '<<', unary: false},
    {id: 'is greater than or equal to', name: 'is greater than or equal to',
        value: '>=', unary: false},
    {id: 'is less than or equal to', name: 'is less than or equal to',
        value: '<=', unary: false},
    {id: 'is Null', name: 'is Null', value: 'IsNull', unary: true},
    {id: 'is NOT Null', name: 'is NOT Null', value: 'IsNotNull', unary: true}
  ],

  rightTypes: [
    {id: 'constant', name: 'V'},  // "V" for value
    {id: 'dimension', name: 'D'}  // "D" for dimension
  ]
});

// class (static) methods
DynamicFilter.reopenClass({

  compileFilters: function(filters) {
    // return the filter string that results from `filters`
    console.log('EXECUTING DynamicFilter.compileFilters()');
    let compiled_filter = '';
    filters.forEach((filter) => {
      if (!filter.first && filter.conj) {
        compiled_filter += filter.conj.value;
      }
      compiled_filter += filter.left.id;
      compiled_filter += filter.filterType.value;
      if (!filter.filterType.unary) {
        if (filter.rightType.id === 'constant') {
          compiled_filter += filter.right.name;
        } else {
          compiled_filter += filter.right.id;
        }
      }
    });
    return compiled_filter;
  },

  parseFilter: function(s, controller) {
    // return the array of DynamicFilter objects that
    // compile to the given filter string
    const filters = Ember.A([]);
    console.log('EXECUTING DynamicFilter.parseFilter()');
    if (!s) {
      return filters;
    }
    const allDims = controller.get('allDims');
    const andDelim = DynamicFilter.conjTypes.findBy('id', 'and').value;
    const orDelim = DynamicFilter.conjTypes.findBy('id', 'or').value;
    const andTerms = s.split(andDelim);
    for (let i = 0; i < andTerms.length; i++) {
      const andTerm = andTerms[i];
      const orTerms = andTerm.split(orDelim);
      for (let j = 0; j < orTerms.length; j++) {
        const orTerm = orTerms[j];
        let conjType = DynamicFilter.conjTypes.findBy('id', 'and');
        if (j > 0) {
          conjType = DynamicFilter.conjTypes.findBy('id', 'or');
        }
        for (let k = 0; k < DynamicFilter.filterTypes.length; k++) {
          const filterType = DynamicFilter.filterTypes[k];
          const toks = orTerm.split(filterType.value);
          if (toks.length !== 2) {
            continue;
          }
          // strip any whitespace
          const leftTok = toks[0].replace(/^\s+|\s+$/g, '');
          const rightTok = toks[1].replace(/^\s+|\s+$/g, '');
          // match dim ID
          const leftMatch = /^[0-9a-fA-F]{24}$/.exec(leftTok);
          if (!leftMatch) {
            // left-side must be dim ID
            throw new Error("Failed to parse filter term: %@".fmt(s));
          }
          const leftDimId = leftMatch[0];
          const leftDim = allDims.findBy('id', leftDimId);
          const leftType = leftDim.get('dataType');
          const filter = DynamicFilter.create({controller: controller});
          filter.set('conj', conjType);
          filter.set('left', {id: leftDimId, name: leftDim.get('name')});
          filter.set('filterType', filterType);
          if (rightTok) {
            // binary operator
            const rightMatch = /^[0-9a-fA-F]{24}$/.exec(rightTok);
            if (rightMatch) {
              // right-side is also a dim ID
              const rightDimId = rightMatch[0];
              const rightDim = allDims.findBy('id', rightDimId);
              const rightType = rightDim.get('dataType');
              if (leftType !== rightType) {
                throw new Error("Type mismatch for filter: %@".fmt(s));
              }
              filter.set('rightType',
                         DynamicFilter.rightTypes.findBy('id', 'dimension'));
              filter.set('right', filter.rightValues.findBy('id', rightDimId));
            } else {
              // right-side is a constant
              filter.set('rightType',
                         DynamicFilter.rightTypes.findBy('id', 'constant'));
              filter.set('right', {id: rightTok, name: rightTok});
            }
          }
          filters.addObject(filter);
        }
      }
    }
    return filters;
  },

  completeFilters: function(filters, completeAll) {
    // maintain state of dynamic dim filters
    console.log('EXECUTING DynamicFilter.completeFilters()');
    for (let i = 0; i < filters.length; i++) {
      const filter = filters.objectAt(i);
      if (i === 0) {
        filter.set('first', true);
      } else {
        filter.set('first', false);
      }
      if (!completeAll && i === filters.length - 1) {
        console.log(`Uncompleting filter ${i}`);
        filter.set('complete', false);
        filter.set('deletable', true);
      } else {
        console.log(`Completing filter ${i}`);
        filter.set('complete', true);
        filter.set('deletable', false);
      }
    }
  }
});

// instance properties and methods
DynamicFilter.reopen({

  // make class properties accessible to template
  boolValues: DynamicFilter.boolValues,
  conjTypes: DynamicFilter.conjTypes,
  filterTypes: DynamicFilter.filterTypes,
  rightTypes: DynamicFilter.rightTypes,

  controller: null,  // controller ref
  conj: null,
  left: null,
  filterType: null,
  rightType: null,
  right: null,
  first: false,
  complete: false,
  deletable: true,

  rightValues: [],

  init: function() {
    console.log('EXECUTING DynamicFilter.init()');
    this.set('conj', DynamicFilter.conjTypes[0]);
    this.set('filterType', DynamicFilter.filterTypes[0]);
    this.set('rightType', DynamicFilter.rightTypes[0]);
    this.set('right', {id: null, name: null});
  },

  and: function() {
    const conj = this.get('conj');
    if (conj && conj.id === 'and') {
      return true;
    }
    return false;
  }.property('conj'),

  or: function() {
    const conj = this.get('conj');
    if (conj && conj.id === 'or') {
      return true;
    }
    return false;
  }.property('conj'),

  isUnary: function() {
    const filterType = this.get('filterType');
    if (filterType && filterType.unary) {
      return true;
    }
    return false;
  }.property('filterType'),

  isRightDynamic: function() {
    // indicates whether right-side of expression is
    // the value of a dynamic dim
    const rightType = this.get('rightType');
    const left = this.get('left');
    if (left && rightType && rightType.id === 'constant') {
      const dynamicDims = this.get('controller.dynamicDims');
      if (dynamicDims && dynamicDims.findBy('id', left.id)) {
        return true;
      }
    }
    return false;
  }.property('left', 'rightType'),

  isRightBoolean: function() {
    // indicates whether right-side of expression is
    // the value of a boolean-valued dynamic dim
    const rightType = this.get('rightType');
    const left = this.get('left');
    if (left && rightType && rightType.id === 'constant') {
      const dynamicDims = this.get('controller.dynamicDims');
      if (dynamicDims) {
        const ddim = dynamicDims.findBy('id', left.id);
        if (ddim && ddim.func && ddim.func.dataType &&
                ddim.func.dataType === 'boolean') {
          return true;
        }
      }
    }
    return false;
  }.property('left', 'rightType'),

  hasValues: function() {
    // indicates whether we have a set of values in this.rightValues
    const isRightDynamic = this.get('isRightDynamic');
    const isRightBoolean = this.get('isRightBoolean');
    if (!isRightDynamic || isRightBoolean) {
      return true;
    }
    return false;
  }.property('isRightDynamic', 'isRightBooean'),

  isCompletable: function() {
    const left = this.get('left');
    const filterType = this.get('filterType');
    const isUnary = this.get('isUnary');
    const rightType = this.get('rightType');
    const right = this.get('right');
    // NOTE: we check right.name, rather than right.id, because
    //       id is null when left is dynamic dimension
    if (left && left.id && filterType &&
        (isUnary || (rightType && right && right.name))) {
      return true;
    }
    return false;
  }.property('left', 'filterType', 'isUnary', 'rightType', 'right'),

  getRightValues: function() {
    console.log('EXECUTING DynamicFilter.getRightValues()');
    const isRightBoolean = this.get('isRightBoolean');
    if (isRightBoolean) {
      this.set('rightValues', DynamicFilter.boolValues);
    } else {
      const rightType = this.get('rightType');
      const left = this.get('left');
      if (rightType && rightType.id === 'dimension') {
        // right-side is dimension
        this.set('rightValues', this.get('controller.allDims'));
      } else if (left && rightType && rightType.id === 'constant') {
        // right-side is constant dimension value
        const dynamicDims = this.get('controller.dynamicDims');
        if (dynamicDims && dynamicDims.findBy('id', left.id)) {
          // right-side is constant dynamic dimension value
          this.set('rightValues', []);
        } else {
          // right-side is constant static dimension value
          // retrieve dimension values from schema API
          Ember.$.get(ENV.api_endpoint + '/schema/dimensionsValues/' + left.id + '/')
            .then((dvs)=> {
              if (dvs) {
                let values = dvs.map((value)=> {return {id: value, name: value};});
                this.set('rightValues', values);
              }
            });
        }
      }
    }
  }.observes('left', 'rightType'),

  clearRight: function() {
    // clear right value whenever left value or rightType changed
    this.set('right', {id: null, name: null});
  }.observes('left', 'rightType'),
});

//
// DYNAMIC DIMENSION CLASS
//

const DynamicDimension = Ember.Object.extend({
  controller: null,  // controller ref
  id: null,
  label: null,
  name: null,
  level: null,
  func: null,
  funcArgs: null,
  filters: null,
  complete: false,
  deletable: true,

  init: function() {
    console.log('EXECUTING DynamicDimension.init()');
    const id = this.get('id');
    if (!id) {
      this.set('id', this.generateID());
    }
    this.set('funcArgs', Ember.A([]));
    this.set('filters', Ember.A([]));
  },

  legalArgs: function() {
    // legal args for the current agg function
    const controller = this.get('controller');
    const func = this.get('func');
    if (func && func.argType === 'number') {
      return controller.get('numericDims');
    }
    return controller.get('allDims');
  }.property('func'),

  hasFilter: function() {
    const filters = this.get('filters');
    if (filters && filters.length > 0) {
      return true;
    }
    return false;
  }.property('filters.@each'),

  isCompletable: function() {
    // indicates whether or not this dynamic dim may be considered "complete"
    const id = this.get('id');
    const label = this.get('label');
    const level = this.get('level');
    const func = this.get('func');
    const funcArgs = this.get('funcArgs');
    const filters = this.get('filters');
    if (id &&
            label &&
            level &&
            func &&
            funcArgs &&
            (func.nargs === 0 ||
             (funcArgs.length === func.nargs && !funcArgs.findBy('id', null))) &&
            filters && !filters.findBy('isCompletable', false)) {
      return true;
    }
    return false;
  }.property('id', 'label', 'level', 'func', 'funcArgs', 'funcArgs.@each',
             'filters', 'filters.@each'),

  _s4: function() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  },

  generateID: function() {
    // generate a "random" mongo-like ID
    return this._s4() + this._s4() + this._s4() +
           this._s4() + this._s4() + this._s4();
  },

  resetArgsFilters: function() {
    // remove any existing funcArgs and filters and then
    // add a single new filter iff func.requireFilter is true
    this.set('funcArgs', Ember.A([]));
    this.set('filters', Ember.A([]));
    const func = this.get('func');
    if (func && func.requireFilter) {
      const filters = this.get('filters');
      filters.addObject(DynamicFilter.create({controller: this.get('controller')}));
    }
  }.observes('func'),

  completeFilters: function() {
    DynamicFilter.completeFilters(this.get('filters'), this.get('complete'));
  }.observes('filters.@each')
});

//
// X-DIMENSION CLASS
//

const XDimension = Ember.Object.extend({
  id: null,
  name: null,
  min: null,
  max: null,
  binSize: null,
  scale: null,

  init: function() {
    this.set('binSize', 1);
    this.set('scale', '1');
  }
});

//
// CONTROLLER CLASS
//

export default Ember.Controller.extend({
  needs: ["application"],
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),

  queryParams: ['startDate', 'endDate', 'queryName'],

  plotTypes: [
    {id: 'bar', name: 'Bar'},
    {id: 'column', name: 'Column'},
    {id: 'line', name: 'Line'},
    {id: 'pie', name: 'Pie'},
  ],

  stackingTypes: [
    {id: null, name: 'None'},
    {id: 'normal', name: 'Normal'},
    {id: 'percent', name: 'Percent'},
  ],

  aggFuncs: [
    {id: 'any', name: 'Any', nargs: 1, argType: null,
        dataType: 'number', yInclude: false, requireFilter: false},
    {id: 'exists', name: 'Exists', nargs: 0, argType: null,
        dataType: 'boolean', yInclude: false, requireFilter: true},
    {id: 'count_events', name: 'CountEvents', nargs: 0, argType: null,
        dataType: 'number', yInclude: true, requireFilter: false},
    {id: 'count', name: 'Count', nargs: 1, argType: null,
        dataType: 'number', yInclude: true, requireFilter: false},
    {id: 'sum', name: 'Sum', nargs: 1, argType: 'number',
        dataType: 'number', yInclude: true, requireFilter: false},
    {id: 'avg', name: 'Avg', nargs: 1, argType: 'number',
        dataType: 'number', yInclude: true, requireFilter: false},
    {id: 'median', name: 'Median', nargs: 1, argType: 'number',
        dataType: 'number', yInclude: true, requireFilter: false},
    {id: 'stddev', name: 'Std Dev', nargs: 1, argType: 'number',
        dataType: 'number', yInclude: true, requireFilter: false},
    {id: 'percent', name: '%', nargs: 1, argType: null,
        dataType: 'number', yInclude: true, requireFilter: true},
    {id: 'min', name: 'Min', nargs: 1, argType: 'number',
        dataType: 'number', yInclude: true, requireFilter: false},
    {id: 'max', name: 'Max', nargs: 1, argType: 'number',
        dataType: 'number', yInclude: true, requireFilter: false},
    {id: 'min_diff', name: 'Min Diff', nargs: 2, argType: 'number',
        dataType: 'number', yInclude: false, requireFilter: false},
    {id: 'max_diff', name: 'Max Diff', nargs: 2, argType: 'number',
        dataType: 'number', yInclude: false, requireFilter: false}
  ],

  yAggFuncs: function() {
    return this.get('aggFuncs').filter((af) => {return af.yInclude;});
  }.property('aggFuncs'),

  _initialize: function() {
    console.log('EXECUTING _initialize()');
    this.set('show', false);
    this.set('newQueryName', null);
    this.set('saveQueryName', null);
    this.set('useDateRange', true);
    this.set('dynamicDims', Ember.A([]));
    this.set('xDim', XDimension.create());
    this.set('yMetric.func', null);
    this.set('yMetric.funcArgs', Ember.A([]));
    this.set('yMetric.filters', Ember.A([]));
    this.set('globalFilters', Ember.A([]));
    this.set('extraFilters', Ember.A([]));
    this.set('limit', null);
    // compare by
    this.set('qgrpvals', null);
    this.set('group_by_object', null);
    this.set('group_by_values', null);
    this.set('compareEnabled', false);
    // hack to control refreshing of col-chart
    this.set('_disableDraw', true);
    this.getQueryNames();
    // default X to date dimension
    const staticDims = this.get('model.dimensions');
    const date_id = this.get('model.dashboard.date');
    if (date_id) {
      const date_dim = staticDims.findBy('id', date_id);
      if (date_dim) {
        const name = date_dim.get('name');
        this.set('xDim', XDimension.create({id: date_id, name: name}));
      }
    }
  },

  initialize: function(params) {
    console.log('EXECUTING initialize()');
    this.set('dynamicDims', Ember.A([]));
    this.set('yMetric', DynamicDimension.create({controller: this}));
    this._initialize();

    // date range
    const startDate = this.get('startDate');
    const endDate = this.get('endDate');
    if (!endDate) {
      this.set('endDate', this.get('model.window.endDate'));
    }
    if (!startDate) {
      this.set(
        'startDate',
        moment(this.get('model.window.endDate'))
          .subtract(2, 'week').format('YYYY-MM-DD')
      );
    }

    // selected query
    const queryName = this.get('queryName');
    if (queryName && queryName !== "null") {
      this.set('selQuery', {id: queryName, name: queryName});
    } else {
      this.set('selQuery', null);
    }

    // compare by
    if (params.group_by_id) {
      this.set('group_by_object', this.get('model.dimensions').findBy('id', params.group_by_id));
      if (params.grpvals) {
        this.set('qgrpvals', params.grpvals.split(',,,'));
      }
      this.set('compareEnabled', true);
    }
  },

  reset: function() {
    console.log('EXECUTING reset()');
    this._initialize();
  },

  allDims: function() {
    // combine dynamic and static dims into single list
    console.log('EXECUTING allDims()');
    const dynamicDims = this.get('dynamicDims');
    const staticDims = this.get('model.dimensions');
    const allDims = [];
    dynamicDims.forEach((dim) => {
      if (dim.complete) {
        allDims.addObject(dim);
      }
    });
    staticDims.forEach((dim) => {
      allDims.addObject(dim);
    });
    return allDims;
  }.property('model.dimensions', 'dynamicDims.@each.complete'),

  levelDims: function() {
    // return white-list of dimensions for dynamic dim levels
    console.log('EXECUTING levelDims()');
    const levelDims = [];
    const staticDims = this.get('model.dimensions');
    const session_id = this.get('model.dashboard.session_table.id_col');
    levelDims.addObject({id: session_id, name: 'Session'});
    const user_id = this.get('model.dashboard.user_table.id_col');
    levelDims.addObject({id: user_id, name: 'User'});
    return levelDims;
  }.property('model.dimensions', 'model.dashboard'),

  isNumeric: function(id) {
    // determine whether or not the given id corresponds
    // to a numeric dynamic or static dimension
    const numberTypes = ['number', 'timestamp'];
    const dynamicDims = this.get('dynamicDims');
    const ddim = dynamicDims.findBy('id', id);
    if (ddim && numberTypes.indexOf(ddim.func.dataType) >= 0) {
      return true;
    }
    const staticDims = this.get('model.dimensions');
    const sdim = staticDims.findBy('id', id);
    if (sdim && numberTypes.indexOf(sdim.get('data_type')) >= 0) {
      return true;
    }
    return false;
  },

  numericDims: function() {
    // numeric dynamic and static dims
    console.log('EXECUTING numericDims()');
    const allDims = this.get('allDims');
    const numericDims = [];
    allDims.forEach((dim) => {
      if (this.isNumeric(dim.id)) {
        numericDims.addObject(dim);
      }
    });
    return numericDims;
  }.property('allDims'),

  isTimeSeries: function() {
    // indicates whether or not the X-dimension is a date
    console.log('EXECUTING isTimeSeries()');
    const xDim = this.get('xDim');
    if (xDim && xDim.id) {
      const staticDims = this.get('model.dimensions');
      const dim = staticDims.findBy('id', xDim.id);
      if (dim && dim.get('data_type') === 'date') {
        return true;
      }
    }
    return false;
  }.property('xDim.id'),

  isHistogram: function() {
    // indicates whether or not the X-dimension is numeric
    console.log('EXECUTING isHistogram()');
    const xDim = this.get('xDim');
    if (xDim && this.isNumeric(xDim.id)) {
      return true;
    }
    return false;
  }.property('xDim.id'),

  isBarChart: function() {
    // indicates whether or not the X-dimension is
    // neither numeric nor date
    if (this.get('isTimeSeries') || this.get('isHistogram')) {
      return false;
    }
    return true;
  }.property('isTimeSeries', 'isHistogram'),

  hasFilter: function() {
    const filters = this.get('globalFilters');
    if (filters && filters.length > 0) {
      return true;
    }
    return false;
  }.property('globalFilters.@each'),

  hasExtraFilter: function() {
    const extraFilters = this.get('extraFilters');
    if (extraFilters && extraFilters.length > 0) {
      return true;
    }
    return false;
  }.property('extraFilters.@each'),

  unCompleteLastDim: function() {
    // make the last dynamic dim editable
    const lastDim = this.get('dynamicDims.lastObject');
    if (lastDim) {
      lastDim.set('complete', false);
    }
  },

  completeDims: function() {
    // maintain state of dynamic dims
    console.log('EXECUTING completeDims()');
    const dynamicDims = this.get('dynamicDims');
    // mark all "completable" dynamic dims with complete = true
    // mark only last dynamic dim with deletable = true
    for (let i = 0; i < dynamicDims.length; i++) {
      const dim = dynamicDims.objectAt(i);
      if (i === dynamicDims.length - 1) {
        dim.set('deletable', true);
      } else {
        dim.set('deletable', false);
      }
      if (dim.get('isCompletable')) {
        dim.set('complete', true);
        dim.set('name', dim.level.name + '.' + dim.label);
      } else {
        dim.set('complete', false);
      }
    }
  }.observes('dynamicDims.@each', 'yMetric.func', 'globalFilters.@each'),

  completeFilters: function() {
    DynamicFilter.completeFilters(this.get('globalFilters'),
                                  this.get('complete'));
  }.observes('globalFilters.@each'),

  completeExtraFilters: function() {
    DynamicFilter.completeFilters(this.get('extraFilters'), false);
  }.observes('extraFilters.@each'),

  onUpdateBinSize: function() {
    // automatically scale inversely proportional to bin size
    const binSize = this.get('xDim.binSize');
    this.set('xDim.scale', '1/%@'.fmt(binSize));
  }.observes('xDim.binSize'),

  filter_str: function() {
    const gf = DynamicFilter.compileFilters(this.get('globalFilters'));
    const ef = DynamicFilter.compileFilters(this.get('extraFilters'));
    if (gf && ef) {
      const andConj = DynamicFilter.conjTypes.findBy('id', 'and');
      return gf + andConj['value'] + ef;
    } else if (gf) {
      return gf;
    } else if (ef) {
      return ef;
    } else {
      return '';
    }
  }.property('_disableDraw'),

  query_params: function() {
    // construct qp_params, which are used to pass
    // advanced_query-specific params to backend
    console.log('EXECUTING query_params()');
    const queryName = this.get('saveQueryName');
    const useDateRange = this.get('useDateRange');
    const dynamicDims = this.get('dynamicDims');
    const yMetric = this.get('yMetric');
    const xDim = this.get('xDim');
    const limit = parseInt(this.get('limit'));
    // choose and set default plot type
    let plotTypeId = 'bar';
    if (this.get('isTimeSeries')) {
      plotTypeId = 'line';
    } else if (this.get('isHistogram')) {
      plotTypeId = 'column';
    }
    const plotTypes = this.get('plotTypes');
    const plotType = plotTypes.findBy('id', plotTypeId);
    this.set('plotType', plotType);
    // choose and set default stacking type
    const stackingTypes = this.get('stackingTypes');
    const stackingType = stackingTypes.findBy('id', null);
    this.set('stackingType', stackingType);
    // construct params
    const params = {
      // chart properties
      xAxisName: xDim.name,
      yAxisName: yMetric.func ? yMetric.func.name : null,
      // API params
      query_id: 'advanced_query',
      startDate: useDateRange ? this.get('startDate') : null,
      endDate: useDateRange ? this.get('endDate') : null,
      qp_params: {
        query_name: queryName,
        dynamic_dims: {},
        y: {},
        x: {},
        limit: limit
      },
      // create dummy values to keep everything happy
      m: this.get('model.dashboard.countmetric'),
      // these random strings cause chart to refresh
      num_id: yMetric.generateID(),
      denom_id: yMetric.generateID()
    };
    // dynamic dims
    dynamicDims.forEach((dim) => {
      params['qp_params']['dynamic_dims'][dim.get('id')] = {
        name: dim.name,
        level: dim.level.id,
        func: dim.func.id,
        args: dim.funcArgs.map((fa) => {return fa.id;}),
        filter: DynamicFilter.compileFilters(dim.get('filters'))
      };
    });
    // y-metric
    params['qp_params']['y'] = {
      func: yMetric.func ? yMetric.func.id : null,
      args: yMetric.funcArgs ? yMetric.funcArgs.map((fa) => {return fa.id;}) : null,
      filter: DynamicFilter.compileFilters(yMetric.get('filters'))
    };
    // x-dim
    params['qp_params']['x'] = {
      dim_id: xDim.id,
      min: parseFloat(xDim.min),
      max: parseFloat(xDim.max),
      bin_size: parseFloat(xDim.binSize),
      scale: xDim.scale
    };
    return params;
  }.property('_disableDraw'),

  disableDraw: function() {
    // determines when "Go" button enabled
    console.log('EXECUTING disableDraw()');
    const xDim = this.get('xDim');
    const yMetric = this.get('yMetric');
    const nullArgs = yMetric.funcArgs.findBy('id', null);
    return !(xDim.id && yMetric.func && !nullArgs && xDim);
  }.property('xDim.id', 'yMetric.func',
             'yMetric.funcArgs.@each', 'yMetric.funcArgs.@each.id'),

  //
  // Save & Load Queries by Name
  //

  disableSave: function() {
    // determine when "Save" button enabled
    console.log('EXECUTING disableSave()');
    const disableDraw = this.get('disableDraw');
    const newQueryName = this.get('newQueryName');
    return (disableDraw || !newQueryName);
  }.property('disableDraw', 'newQueryName'),

  getQueryNames: function () {
    // retrieve names of all saved queries
    console.log('EXECUTING getQueryNames()');
    const dataset_id = this.get('model.dataset_id');
    Ember.$.get(
      ENV.api_endpoint + '/chart/advanced/' + dataset_id + '/names/'
    ).then((names) => {
      let allQueries = [];
      if (names) {
        allQueries = names.map((name) => {
          return {id: name, name: name};
        });
      }
      allQueries.unshift({id: null, name: null});
      this.set('allQueries', allQueries);
    });
  },

  makeDynamicDim: function(dynamicDimParams, seenDynamicDimIds, dimId) {
    // A recursive function for loading a DynamicDimension from a
    // collection of params. Recursion is needed so that DynamicDimension
    // objects are added to array according to dependency relationships.
    console.log('EXECUTING makeDynamicDim()');
    seenDynamicDimIds.add(dimId);
    const allDims = this.get('allDims');
    const dynamicDims = this.get('dynamicDims');
    const levelDims = this.get('levelDims');
    const aggFuncs = this.get('aggFuncs');
    const dimParams = dynamicDimParams[dimId];
    const levelDim = levelDims.findBy('id', dimParams.level);
    const func = aggFuncs.findBy('id', dimParams.func);
    const dynamicDim = DynamicDimension.create({
      controller: this,
      id: dimId,
      name: dimParams.name,
      label: dimParams.name.split('.').slice(-1)[0],
      level: {id: dimParams.level, name: levelDim.name},
      func: func
    });
    for (let i = 0; i < dimParams.args.length; i++) {
      console.log('dimParams.args[%@] = %@'.fmt(i, dimParams.args[i]));
      const argDimId = dimParams.args[i];
      let argDim = allDims.findBy('id', argDimId);
      if (!argDim) {
        // argDim must be a dynamicDim that have
        // not yet constructed from params
        if (!(argDimId in dynamicDimParams)) {
          throw new Error('Unrecognized dimId: %@'.fmt(argDimId));
        }
        // recurse
        argDim = this.makeDynamicDim(dynamicDimParams,
                                     seenDynamicDimIds,
                                     argDimId);
      }
      dynamicDim.funcArgs.addObject({id: argDim.id, name: argDim.get('name')});
    }
    if (dimParams.filter) {
      dynamicDim.set('filters',
                     DynamicFilter.parseFilter(dimParams.filter, this));
    }
    dynamicDims.addObject(dynamicDim);
    return dynamicDim;
  },

  loadQueryParams: function() {
    // load params for the selected saved query
    console.log('EXECUTING loadQueryParams()');
    const dataset_id = this.get('model.dataset_id');
    const selQuery = this.get('selQuery');
    Ember.$.get(
      ENV.api_endpoint + '/chart/advanced/' + dataset_id + '/params/',
      {name: selQuery.name}
    ).then((params) => {
      if (params) {
        console.log('Loading params for ' + selQuery.name);
        this.reset();

        // NOTE: We do not load dates. This is a feature since it
        // makes persisted queries more re-useable.

        // dynamic dims
        if ('dynamic_dims' in params) {
          const seenDynamicDimIds = new Ember.Set();
          const dynamicDims = this.get('dynamicDims');
          const levelDims = this.get('levelDims');
          const aggFuncs = this.get('aggFuncs');
          for (let dimId in params.dynamic_dims) {
            if (params.dynamic_dims.hasOwnProperty(dimId)) {
              if (seenDynamicDimIds.contains(dimId)) {
                continue;
              }
              this.makeDynamicDim(params.dynamic_dims,
                                  seenDynamicDimIds,
                                  dimId);
            }
          }
        }

        // X dimension
        const allDims = this.get('allDims');
        const xDim = allDims.findBy('id', params.x.dim_id);
        this.set('xDim.id', xDim.id);
        this.set('xDim.name', xDim.get('name'));
        if (params.x.bin_size) {
          this.set('xDim.binSize', params.x.bin_size);
        }
        if (params.x.scale) {
          this.set('xDim.scale', params.x.scale);
        }
        if (params.x.min) {
          this.set('xDim.min', params.x.min);
        }
        if (params.x.max) {
          this.set('xDim.max', params.x.max);
        }

        // Y metric
        const aggFuncs = this.get('aggFuncs');
        const func = aggFuncs.findBy('id', params.y.func);
        this.set('yMetric.func', func);
        const yMetric = this.get('yMetric');
        for (let i = 0; i < params.y.args.length; i++) {
          const funcArg = allDims.findBy('id', params.y.args[i]);
          yMetric.funcArgs.addObject({id: funcArg.id, name: funcArg.get('name')});
        }
        if (params.y.filter) {
          this.set('yMetric.filters',
                   DynamicFilter.parseFilter(params.y.filter, this));
        }

        // global filter
        if (params.filter) {
          this.set('globalFilters',
                   DynamicFilter.parseFilter(params.filter, this));
        }

        // limit
        if (params.limit) {
          this.set('limit', params.limit);
        }

        // compare by
        // TODO: Populate compare by/segmenting
      }
    });
  },

  onQuerySelected: function() {
    console.log('EXECUTING onQuerySelected()');
    const selQuery = this.get('selQuery');
    const saveQueryName = this.get('saveQueryName');
    if (selQuery) {
      this.set('queryName', selQuery.name);
      if (selQuery.name === saveQueryName) {
        // just saved a query, no need to load
        this.set('saveQueryName', null);
        this.set('newQueryName', null);
      } else {
        // just chose query, so load its params
        this.loadQueryParams();
      }
    } else {
      this.set('queryName', null);
      this.reset();
    }
  }.observes('selQuery'),

  selectSavedQueryName: function() {
    // update selected query name
    console.log('EXECUTING selectSavedQueryName()');
    const saveQueryName = this.get('saveQueryName');
    if (saveQueryName) {
      const allQueries = this.get('allQueries');
      const saveQuery = allQueries.findBy('id', saveQueryName);
      if (saveQuery) {
        this.set('selQuery', {id: saveQuery.id, name: saveQuery.name});
      }
    }
  }.observes('allQueries'),

  loadingGroupByValues: false,
  getGroupByValues: function () {
    console.log('EXECUTING getGroupByValues()');
    let gid = this.get('group_by_id');
    if (gid) {
      this.set('loadingGroupByValues', true);
      Ember.$.get(ENV.api_endpoint + '/schema/values/' + gid + '/',
                  {limit: 1000, sort_by_count: true})
        .then((dimensionsValues)=> {
          if (this.get('group_by_id') === gid) {
            this.set('loadingGroupByValues', false);
            if (dimensionsValues) {
              let default_val_ct = this.get('default_val_ct');
              if (default_val_ct > 0) {
                let selectedvals = dimensionsValues.splice(
                  0, this.get('default_val_ct')
                );
                this.set('qgrpvals', selectedvals);
                this.set('grpvals', selectedvals.join(',,,'));
              }
              this.set('group_by_values', dimensionsValues.sort());
            } else {
              this.set('group_by_values', null);
              this.set('qgrpvals', null);
              this.set('grpvals', null);

            }
          }
        });
    } else {
      this.set('group_by_values', null);
    }
  },

  fetchGroupByValues: function () {
    console.log('EXECUTING fetchGroupByValues()');
    Ember.run.once(this, 'getGroupByValues');
  }.observes('group_by_id'),

  actions: {

    save: function() {
      // draw with save_name
      const newQueryName = this.get('newQueryName');
      this.set('saveQueryName', newQueryName);
      this.send('draw');
    },

    onChartLoad: function() {
      // triggered when chart data has loaded
      this.getQueryNames();
    },

    // DRAW

    draw: function() {
      console.log('EXECUTING actions.draw()');
      // override to force refresh of col-chart
      this.set('_disableDraw', true);
      this.set('_disableDraw', false);

      if (this.get('disableDraw')) {
        return;
      }
      const gid = this.get('group_by_object.id');
      if (this.get('group_by_id') !== gid) {
        this.set('group_by_values', null);
        this.set('qgrpvals', null);
        this.set('grpvals', null);
        this.set('group_by_id', gid);
      }
      this.set('show', 'chart');
    },

    // DYNAMIC DIMENSIONS

    addDimension: function() {
      const dynamicDims = this.get('dynamicDims');
      if (!dynamicDims.findBy('isCompletable', false)) {
        dynamicDims.addObject(DynamicDimension.create({controller: this}));
      }
    },

    removeDimension: function(id) {
      const dynamicDims = this.get('dynamicDims');
      const dynamicDim = dynamicDims.findBy('id', id);
      const dynamicDimIdx = dynamicDims.indexOf(dynamicDim);
      if (dynamicDimIdx !== -1) {
        dynamicDims.removeAt(dynamicDimIdx);
      }
      this.unCompleteLastDim();
    },

    selectLevel: function(sel, val) {
      // set the level of the last dynamic dim
      const lastDim = this.get('dynamicDims.lastObject');
      const levelDims = this.get('levelDims');
      const levelDim = levelDims.findBy('id', val);
      if (levelDim) {
        lastDim.set('level', {id: val, name: levelDim.name});
      }
    },

    // DYNAMIC DIMENSION FUNCTION ACTIONS

    selectFunc: function(sel, val) {
      // set the aggregate function of the last dynamic dim
      const dynamicDims = this.get('dynamicDims');
      const lastDim = dynamicDims.get('lastObject');
      const aggFuncs = this.get('aggFuncs');
      const func = aggFuncs.findBy('id', val);
      lastDim.set('func', func);
      if (func) {
        // create proper number of args for function
        lastDim.set('funcArgs', []);
        for (let i = 0; i < func.nargs; i++) {
          lastDim.funcArgs.addObject({id: null, name: null});
        }
      }
    },

    selectFuncArg: function(sel, val) {
      // set the first null arg of the last dynamic dim
      const funcArgs = this.get('dynamicDims.lastObject.funcArgs');
      let funcArg = funcArgs.findBy('id', null);
      if (typeof funcArg === 'undefined') {
         funcArg = funcArgs.get('lastObject');
      }
      const allDims = this.get('allDims');
      const argDim = allDims.findBy('id', val);
      if (argDim) {
        const argName = argDim.get('name');
        Ember.set(funcArg, 'id', val);
        Ember.set(funcArg, 'name', argName);
      }
    },

    // DYNAMIC DIMENSION FILTER ACTIONS

    addDimFilter: function() {
      const filters = this.get('dynamicDims.lastObject.filters');
      if (!filters.findBy('isCompletable', false)) {
        filters.addObject(DynamicFilter.create({controller: this}));
      }
    },

    removeDimFilter: function() {
      const filters = this.get('dynamicDims.lastObject.filters');
      filters.removeAt(filters.length - 1);
    },

    selectDimFilterConj: function(sel, val) {
      const filter = this.get('dynamicDims.lastObject.filters.lastObject');
      const conj = DynamicFilter.conjTypes.findBy('id', val);
      filter.set('conj', conj);
    },

    selectDimFilterLeft: function(sel, val) {
      const filter = this.get('dynamicDims.lastObject.filters.lastObject');
      const allDims = this.get('allDims');
      const dim = allDims.findBy('id', val);
      if (dim) {
        const name = dim.get('name');
        filter.set('left', {id: val, name: name});
      }
    },

    selectDimFilterType: function(sel, val) {
      const filter = this.get('dynamicDims.lastObject.filters.lastObject');
      const filterType = DynamicFilter.filterTypes.findBy('id', val);
      filter.set('filterType', filterType);
    },

    selectDimFilterRightType: function(sel, val) {
      const filter = this.get('dynamicDims.lastObject.filters.lastObject');
      const rightType = DynamicFilter.rightTypes.findBy('id', val);
      filter.set('rightType', rightType);
    },

    selectDimFilterRight: function(sel, val) {
      const filter = this.get('dynamicDims.lastObject.filters.lastObject');
      const rightValue = filter.rightValues.findBy('id', val);
      filter.set('right', rightValue);
    },

    // Y-METRIC ACTIONS

    selectYFunc: function(sel, val) {
      // set the Y aggregate function
      const yMetric = this.get('yMetric');
      const aggFuncs = this.get('aggFuncs');
      const func = aggFuncs.findBy('id', val);
      this.set('yMetric.func', func);
      if (func) {
        // create proper number of args for function
        this.set('yMetric.funcArgs', []);
        for (let i = 0; i < func.nargs; i++) {
          yMetric.funcArgs.addObject({id: null, name: null});
        }
      }
    },

    selectYFuncArg: function(sel, val) {
      // set the first null arg of the Y metric
      const funcArgs = this.get('yMetric.funcArgs');
      let funcArg = funcArgs.findBy('id', null);
      if (typeof funcArg === 'undefined') {
        funcArg = funcArgs.get('lastObject');
      }
      const allDims = this.get('allDims');
      const argDim = allDims.findBy('id', val);
      if (argDim) {
        const argName = argDim.get('name');
        Ember.set(funcArg, 'id', val);
        Ember.set(funcArg, 'name', argName);
      }
    },

    // Y-METRIC FILTER ACTIONS

    addYFilter: function() {
      const filters = this.get('yMetric.filters');
      if (!filters.findBy('isCompletable', false)) {
        filters.addObject(DynamicFilter.create({controller: this}));
      }
    },

    removeYFilter: function() {
      const filters = this.get('yMetric.filters');
      filters.removeAt(filters.length - 1);
    },

    selectYFilterConj: function(sel, val) {
      const filter = this.get('yMetric.filters.lastObject');
      const conj = DynamicFilter.conjTypes.findBy('id', val);
      filter.set('conj', conj);
    },

    selectYFilterLeft: function(sel, val) {
      const filter = this.get('yMetric.filters.lastObject');
      const allDims = this.get('allDims');
      const dim = allDims.findBy('id', val);
      if (dim) {
        const name = dim.get('name');
        filter.set('left', {id: val, name: name});
      }
    },

    selectYFilterType: function(sel, val) {
      const filter = this.get('yMetric.filters.lastObject');
      const filterType = DynamicFilter.filterTypes.findBy('id', val);
      filter.set('filterType', filterType);
    },

    selectYFilterRightType: function(sel, val) {
      const filter = this.get('yMetric.filters.lastObject');
      const rightType = DynamicFilter.rightTypes.findBy('id', val);
      filter.set('rightType', rightType);
    },

    selectYFilterRight: function(sel, val) {
      const filter = this.get('yMetric.filters.lastObject');
      const rightValue = filter.rightValues.findBy('id', val);
      filter.set('right', rightValue);
    },

    // X-DIMENSION ACTIONS

    selectX: function(sel, val) {
      // set the X dimension
      const allDims = this.get('allDims');
      const xDim = allDims.findBy('id', val);
      this.set('xDim.id', val);
      this.set('xDim.name', xDim.get('name'));
      if (this.get('isBarChart')) {
        this.set('limit', 10);
      } else {
        this.set('limit', null);
      }
    },

    // GLOBAL FILTER ACTIONS

    addGlobalFilter: function() {
      const filters = this.get('globalFilters');
      if (!filters.findBy('isCompletable', false)) {
        filters.addObject(DynamicFilter.create({controller: this}));
      }
    },

    removeGlobalFilter: function() {
      const filters = this.get('globalFilters');
      filters.removeAt(filters.length - 1);
    },

    selectGlobalFilterConj: function(sel, val) {
      const filter = this.get('globalFilters.lastObject');
      const conj = DynamicFilter.conjTypes.findBy('id', val);
      filter.set('conj', conj);
    },

    selectGlobalFilterLeft: function(sel, val) {
      const filter = this.get('globalFilters.lastObject');
      const allDims = this.get('allDims');
      const dim = allDims.findBy('id', val);
      if (dim) {
        const name = dim.get('name');
        filter.set('left', {id: val, name: name});
      }
    },

    selectGlobalFilterType: function(sel, val) {
      const filter = this.get('globalFilters.lastObject');
      const filterType = DynamicFilter.filterTypes.findBy('id', val);
      filter.set('filterType', filterType);
    },

    selectGlobalFilterRightType: function(sel, val) {
      const filter = this.get('globalFilters.lastObject');
      const rightType = DynamicFilter.rightTypes.findBy('id', val);
      filter.set('rightType', rightType);
    },

    selectGlobalFilterRight: function(sel, val) {
      const filter = this.get('globalFilters.lastObject');
      const rightValue = filter.rightValues.findBy('id', val);
      filter.set('right', rightValue);
    },

    // EXTRA FILTER ACTIONS

    addExtraFilter: function() {
      const filters = this.get('extraFilters');
      if (!filters.findBy('isCompletable', false)) {
        filters.addObject(DynamicFilter.create({controller: this}));
      }
    },

    removeExtraFilter: function() {
      const filters = this.get('extraFilters');
      filters.removeAt(filters.length - 1);
    },

    selectExtraFilterConj: function(sel, val) {
      const filter = this.get('extraFilters.lastObject');
      const conj = DynamicFilter.conjTypes.findBy('id', val);
      filter.set('conj', conj);
    },

    selectExtraFilterLeft: function(sel, val) {
      const filter = this.get('extraFilters.lastObject');
      const allDims = this.get('allDims');
      const dim = allDims.findBy('id', val);
      if (dim) {
        const name = dim.get('name');
        filter.set('left', {id: val, name: name});
      }
    },

    selectExtraFilterType: function(sel, val) {
      const filter = this.get('extraFilters.lastObject');
      const filterType = DynamicFilter.filterTypes.findBy('id', val);
      filter.set('filterType', filterType);
    },

    selectExtraFilterRightType: function(sel, val) {
      const filter = this.get('extraFilters.lastObject');
      const rightType = DynamicFilter.rightTypes.findBy('id', val);
      filter.set('rightType', rightType);
    },

    selectExtraFilterRight: function(sel, val) {
      const filter = this.get('extraFilters.lastObject');
      const rightValue = filter.rightValues.findBy('id', val);
      filter.set('right', rightValue);
    },

    // COMPARE BY

    updateGroupByValues: function (values) {
      console.log('EXECUTING actions.updateGroupByValues()');
      this.set('grpvals', values.join(",,,"));
      this.set('qgrpvals', values);
    },

    enableCompare: function (enable) {
      console.log('EXECUTING actions.emableCompare()');
      if (!enable) {
        this.set('group_by_object', null);
      }
      this.set('compareEnabled', enable);
    },

    selectGroupBy: function (dimension, dimid) {
      console.log('EXECUTING actions.selectGroupBy()');
      this.set('group_by_object', dimension);
    },
  }
});
