import Ember from 'ember';
import ENV from 'datasenseui/config/environment';
// import DimRef from '../../../chart/advanced_query/controller';
// import DynamicFilter from '../../../chart/advanced_query/controller';
// import DynamicDimension from '../../../chart/advanced_query/controller';
// import XDimension from '../../../chart/advanced_query/controller';


const DimRef = Ember.Object.extend({
  id: null,
  name: null
});

const DynamicFilter = Ember.Object.extend({

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
  ],

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
    this.set('conj', this.conjTypes[0]);
    this.set('filterType', this.filterTypes[0]);
    this.set('rightType', this.rightTypes[0]);
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
      const dynamicDims = this.get('controller.allDims');
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
      const dynamicDims = this.get('controller.allDims');
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

  updateRight: function(){
    console.log('EXECUTING DynamicFilter.updateRight()');
    if( this.get('right') && this.get('rightValues') && this.get('rightValues').length>0 && this.get('rightValues').findBy('id', this.get('right').id) ){
      this.set('right', this.get('rightValues').findBy('id', this.get('right').id));
    }
  }.observes('rightValues'),

  getRightValues: function() {
    console.log('EXECUTING DynamicFilter.getRightValues()');
    const isRightBoolean = this.get('isRightBoolean');
    if (isRightBoolean) {
      this.set('rightValues', this.get('boolValues'));
    } else {
      const rightType = this.get('rightType');
      const left = this.get('left');
      if (rightType && rightType.id === 'dimension') {
        // right-side is dimension
        this.set('rightValues', this.get('controller.allDims'));
      } else if (left && rightType && rightType.id === 'constant') {
        // right-side is constant dimension value
        const dynamicDims = this.get('controller.allDims');
        // right-side is constant static dimension value
        // retrieve dimension values from schema API
        Ember.$.get(ENV.api_endpoint + '/schema/dimensionsValues/' + left.id + '/')
          .then((dvs)=> {
            if (dvs) {
              let values = dvs.map((value)=> {return {id: value, name: value};});
              this.set('rightValues', values);
              this.updateRight();
            }
          });
      }
    }
  }.observes('left', 'rightType'),

  clearRight: function() {
    // clear right value whenever left value or rightType changed
    this.set('right', {id: null, name: null});
  }.observes('left', 'rightType')
});

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
    this.set('funcArgs', Ember.A([]));
    this.set('filters', Ember.A([]));
  },

  legalArgs: function() {
    // legal args for the current agg function
    const func = this.get('func');
    if (func && func.argType === 'number') {
      return this.get('numericDims');
    }
    return this.get('dimensions');
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
    // maintain state of dynamic dim filters
    console.log('EXECUTING DynamicDimension.completeFilters()');
    const filters = this.get('filters');
    for (let i = 0; i < filters.length; i++) {
      const filter = filters.objectAt(i);
      if (i === 0) {
        filter.first = true;
      } else {
        filter.first = false;
      }
    }
  }.observes('filters.@each'),

  getFilterStr: function() {
    // return the filter string that results from `filters`
    const filters = this.get('filters');
    let compiled_filter = '';
    filters.forEach((filter) => {
      try{
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
      }catch(ex){
      }
    });
    return compiled_filter;
  }
});

const XDimension = Ember.Object.extend({
  id: null,
  name: null,
  min: null,
  max: null,
  bin_size: null,
  scale: null,

  init: function() {
    this.set('bin_size', 1);
    this.set('scale', '1');
  }
});


export default Ember.Component.extend({
  store: Ember.inject.service(),

  aggFuncs: [
    {id: 'any', name: 'Any', nargs: 1, argType: null,
        dataType: 'number', yInclude: false, requireFilter: false},
    {id: 'exists', name: 'Exists', nargs: 0, argType: null,
        dataType: 'boolean', yInclude: false, requireFilter: true},
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

  uncompileFilterStr: function(filter_str){
    let filter_arr = [];
    let or_op = DynamicFilter.create().conjTypes.findBy('id', 'or');
    let and_op = DynamicFilter.create().conjTypes.findBy('id', 'and');
    let first = true;
    let last_term_pos = 0;
    if(!filter_str){
      return filter_arr;
    }
    for (let i = 0, len = filter_str.length; i < len; i++) {
      if( filter_str[i] === and_op.value){
        let filter_obj = this.parseFilterStr(filter_str.slice(last_term_pos, i));
        filter_obj.set('conj', and_op);
        filter_obj.set('first', first);
        filter_arr.push(filter_obj);
        first = false;
        last_term_pos = i+1;
      }else if(filter_str[i] === ',' && i+1 < filter_str.length && filter_str[i+1] === ','){
        let filter_obj = this.parseFilterStr(filter_str.slice(last_term_pos, i));
        filter_obj.set('conj', or_op);
        filter_obj.set('first', first);
        filter_arr.push(filter_obj);
        last_term_pos = i+2;
        first = false;
      }else if ( i+1 === filter_str.length ){
        let filter_obj = this.parseFilterStr(filter_str.slice(last_term_pos, i+1));
        filter_obj.set('conj', and_op);
        filter_obj.set('first', first);
        filter_arr.push(filter_obj);
        last_term_pos = i+1;
        first = false;
      }
    }
    return filter_arr;
  },

  parseFilterStr: function(str){
    const allDims = this.get('allDims');
    let dummyFilter = DynamicFilter.create();
    for( let i =0; i < dummyFilter.filterTypes.length; i++ ){
      let comps = str.split(dummyFilter.filterTypes[i].value);
      if (comps.length > 1){
        let rightType = dummyFilter.rightTypes.findBy('id', 'dimension');
        let left = DimRef.create({'id': comps[0], 'name': allDims.findBy('id', comps[0]).get('name')});
        let rightDim = allDims.findBy('id', comps[1]);
        let right = {'id': comps[1], 'name': comps[1]};
        if ( rightDim === undefined ){
          rightType = dummyFilter.rightTypes.findBy('id', 'constant');
        }else{
          right = DimRef.create({'id': comps[1], 'name': rightDim.get('name')});
        }
        let filter_obj = DynamicFilter.create({controller: this, left: left, right: right, filterType: dummyFilter.filterTypes[i], rightType: rightType,
                          conjTypes: dummyFilter.conjTypes, filterTypes: dummyFilter.filterTypes, rightTypes: dummyFilter.rightTypes});
        filter_obj.set('rightType', rightType);
        filter_obj.set('filterType', dummyFilter.filterTypes[i]);
        filter_obj.getRightValues();
        filter_obj.set('right', right);
        filter_obj.updateRight();
        return filter_obj;
      }
    }
  },

  allDims: function() {
    // combine dynamic and static dims into single list
    console.log('EXECUTING allDims()');
    const staticDims = this.get('model.dimensions');
    const allDims = [];
    staticDims.forEach((dim) => {
      allDims.addObject(dim);
    });
    return allDims;
  }.property('model.dimensions'),

  init: function(){
    this._super(...arguments);
    this.errors = [];

    this.set('dynamicDim', DynamicDimension.create((this.get('factor.calculation'))));
    this.set('dynamicDim.func', this.get('aggFuncs').findBy('id', this.get('factor.calculation.func')));
    this.set('model', {
      factor: this.get('factor'),
      dimensions:this.get('dimensions'),
      metrics: this.get('metrics'),
      dataset_id: this.get('dataset_id'),
      dataset: this.get('dataset'),
      dashboard:this.get('dashboard')
    });
    this.allDims;
    this.set('dynamicDim.filters', this.uncompileFilterStr(this.get('dynamicDim.filter')));
  },

  initialize: function(params) {
    console.log('EXECUTING initialize()');
    // create Y metric
    const staticDims = this.get('model.dimensions');
    this._super(params);
  },

  reset: function() {
    console.log('EXECUTING reset()');
    this.set('show', false);
    this.set('xDim', XDimension.create());
    this.set('yMetric', DynamicDimension.create({controller: this}));
    this.set('globalFilters', Ember.A([]));
    this.set('limit', null);
    this.set('_disableDraw', true);
    this._super();
  },

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
    console.log('EXECUTING isNumeric()');
    const numberTypes = ['number', 'timestamp'];
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

  legalArgs: function() {
    // legal args for the current agg function
    const func = this.get('dynamicDim.func');
    if (func && func.argType === 'number') {
      return this.get('numericDims');
    }
    return this.get('allDims');
  }.property('dynamicDim.func'),

  getFilterStr: function() {
    // return the filter string that results from `globalFilters`
    const filters = this.get('dynamicDim.filters');
    let compiled_filter = '';
    if (filters) {
      filters.forEach((filter) => {
        try{
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
        }catch(ex){
        }
      });
    }
    return compiled_filter;
  },

  updateFilterStr: function(){
    this.set('model.factor.calculation.filter', this.getFilterStr());
  }.observes('dynamicDim.filters.@each.right','dynamicDim.filters.@each.rightType', 'dynamicDim.filters.@each.conj'),

  filter_str: function() {
    return this.getFilterStr();
  }.property('_disableDraw'),

  actions: {

    selectLevel: function(sel, val) {
      // set the level of the last dynamic dim
      const lastDim = this.get('dynamicDim');
      const levelDims = this.get('levelDims');
      const levelDim = levelDims.findBy('id', val);
      lastDim.set('level', DimRef.create({id: val, name: levelDim.name}));
      this.set('model.factor.calculation.level', lastDim.get('level'));
    },

    // DYNAMIC DIMENSION FUNCTION ACTIONS

    selectFunc: function(sel, val) {
      // set the aggregate function of the last dynamic dim
      const lastDim = this.get('dynamicDim');
      const aggFuncs = this.get('aggFuncs');
      const func = aggFuncs.findBy('id', val);
      lastDim.set('func', func);
      this.set('model.factor.calculation.func', lastDim.get('func.id'));
      // create proper number of args for function
      lastDim.set('args', []);
      this.set('model.factor.calculation.args', lastDim.get('args'));
      for (let i = 0; i < func.nargs; i++) {
        lastDim.args.addObject(DimRef.create());
      }
    },

    selectFuncArg: function(arg_pos, sel, val) {
      // set the first null arg of the last dynamic dim
      const funcArgs = this.get('dynamicDim.args');
      let funcArg = funcArgs[arg_pos];
      if (typeof funcArg === 'undefined') {
         funcArg = funcArgs.get('lastObject');
      }
      const allDims = this.get('allDims');
      const argDim = allDims.findBy('id', val);
      const argName = argDim.get('name');
      funcArgs[arg_pos] = {'id': val, 'name':argName};
    },

    // DYNAMIC DIMENSION FILTER ACTIONS

    addDimFilter: function() {
      console.log('EXECUTING addDimFilter()');
      const filters = this.get('dynamicDim.filters');
      filters.addObject(DynamicFilter.create({controller: this}));
      if(filters.length>0){
        filters[0].set('first', true);
      }
    },

    removeDimFilter: function(pos) {
      console.log('EXECUTING removeDimFilter()');
      const filters = this.get('dynamicDim.filters');
      const removingObject = filters[pos];
      filters.removeObject(removingObject);
      if(filters.length>0){
        filters[0].set('first', true);
      }
    },

    selectDimFilterConj: function(pos, sel, val) {
      const filter = this.get('dynamicDim.filters')[pos];
      const conj = filter.conjTypes.findBy('id', val);
      filter.set('conj', conj);
    },

    selectDimFilterLeft: function(pos, sel, val) {
      const filter = this.get('dynamicDim.filters')[pos];
      const allDims = this.get('allDims');
      const dim = allDims.findBy('id', val);
      const name = dim.get('name');
      filter.set('left', DimRef.create({id: val, name: name}));
    },

    selectDimFilterType: function(pos, sel, val) {
      const filter = this.get('dynamicDim.filters')[pos];
      const filterType = filter.filterTypes.findBy('id', val);
      filter.set('filterType', filterType);
    },

    selectDimFilterRightType: function(pos, sel, val) {
      const filter = this.get('dynamicDim.filters')[pos];
      const rightType = filter.rightTypes.findBy('id', val);
      filter.set('rightType', rightType);
    },

    selectDimFilterRight: function(pos, sel, val) {
      const filter = this.get('dynamicDim.filters')[pos];
      const rightValue = filter.rightValues.findBy('id', val);
      filter.set('right', rightValue);
    }
  }
});
