import Ember from 'ember';
export default Ember.Component.extend({
  store: Ember.inject.service(),
  isMini: false,

  factor_type: null,
  factor_name: null,
  factor_data_type: null,
  factor_better_direction: "Higher",
  factor_description: null,
  factor_group: null,
  factor_tablename: null,
  factor_calculation_type: null,
  factor_calculation_num: null,
  factor_calculation_denom: null,
  factor_calculation_mapper: null,
  factor_calculation_reducer: null,
  factor_calculation_colname: null,

  showChart: true,

  tableColumns: null,

  chartStartDate: function () {
    return moment(this.get('model.window.endDate')).subtract(14, 'days').format('YYYY-MM-DD');
  }.property('model.window.endDate'),
  fetchColumns: function () {
    let t = this.get('factor_tablename');
    if (!t) {
      this.set('tableColumns', null);
      return;
    }
    let dataset_id = this.get('dataset_id');
    let colquery = this.get('store').query('column', {'dataset_id': dataset_id, table: t});
    let self = this;
    colquery.then(function (cols) {
      self.set('tableColumns', cols);
    }, function (error) {
      console.log(error);
    });
  },
  processColumns: function () {
    Ember.run.once(this, 'fetchColumns');
  }.observes('factor_tablename'),

  didReceiveAttrs: function () {
    let factor = this.get('factor');
    let tables = this.get('tables');
    let fut = null;
    let fdt = null;

    if (!factor) {
      this.set('factor_name', null);
      this.set('factor_description', null);
      this.set('factor_group', null);
      this.set('factor_calculation_type', 'Column');

      this.set('factor_calculation_mapper', null);
      this.set('factor_calculation_reducer', 'sum');
      this.set('factor_calculation_colname', null);
      this.set('factor_calculation_num', null);
      this.set('factor_calculation_denom', null);
      this.set('factor_better_direction', "Higher");
      if (tables) {
        this.set('factor_tablename', tables[0].id);
      } else {
        this.set('factor_tablenames', null);
      }
      if (this.get('factor_type') === 'Metric') {
        fdt = 'number';
      } else {
        fdt = 'string';
      }
    } else {
      this.set('factor_type', factor.get('type'));
      fdt = factor.get('data_type');
      fut = factor.get('unit_type');
      this.set('factor_name', factor.get('name'));
      this.set('factor_description', factor.get('description'));
      this.set('factor_group', factor.get('group'));
      this.set('factor_tablename', factor.get('calculation.tablename'));
      this.set('factor_calculation_type', factor.get('calculation.type'));
      this.set('factor_calculation_num', factor.get('calculation.numerator'));
      this.set('factor_calculation_denom', factor.get('calculation.denominator'));
      this.set('factor_calculation_colname', factor.get('calculation.colname'));
      this.set('factor_calculation_mapper', factor.get('calculation.mapper'));
      this.set('factor_better_direction', factor.get('better_direction'));

      let reducer = factor.get('calculation.reducer');
      if (!reducer) {
        reducer = "sum";
      }
      this.set('factor_calculation_reducer', reducer);
    }
    let _this = this;
    let fdts = this.get('dataTypeChoices');
    fdts.forEach(function (dtc) {
      if (dtc.data_type === fdt &&
        (_this.get('factor_type') === 'Dimension' || dtc.unit_type === fut)) {
        _this.set('factor_data_type', dtc);
      }
    });
  }.observes('factor'),
  dataTypeChoices: function () {
    var type = this.get('factor_type');
    if (type === 'Metric') {
      return [{name: 'Number', data_type: 'number', unit_type: null},
        {name: 'Percentage', data_type: 'rate', unit_type: '%'},
        {name: 'Currency', data_type: 'number', unit_type: '$'}];
    } else {
      return [{name: 'String', data_type: 'string'},
        {name: 'Number', data_type: 'number'},
        {name: 'Id', data_type: 'id'},
        {name: 'Date', data_type: 'date'},
        {name: 'Boolean', data_type: 'boolean'}];
    }
  }.property('factor_type'),

  aggregateFunction: [{name: 'sum', id: 'sum', sql: 'SUM'}, {
    name: 'count',
    id: 'count',
    sql: 'COUNT'
  }, {name: 'count distinct', id: 'count_distinct', sql: 'COUNT(DISTINCT'},
  {name: 'Average', id: 'avg', sql: 'avg'}],
  calculationChoices: [{name: "Simple", id: 'Column'},
    {name: "Ratio", id: 'Ratio'}, {name: "SQL", id: 'Function'}, {name: "Advanced", id: 'Advanced'}],
  saveText: null,
  isMetric: Ember.computed.equal('factor_type', 'Metric'),
  isDimension: Ember.computed.equal('factor_type', 'Dimension'),

  hasAdvanced: Ember.computed.equal('factor_calculation_type', 'Advanced'),
  hasFunction: Ember.computed.equal('factor_calculation_type', 'Function'),
  hasRatio: Ember.computed.equal('factor_calculation_type', 'Ratio'),
  hasSimple: Ember.computed.equal('factor_calculation_type', 'Column'),

  numerator: null,
  denominator: null,


  cancelFactor: function () {
    var fctr = this.get('factor');
    if (!fctr) {
      return;
    }
    fctr.reload();
    fctr.rollback();
    this.sendAction('cancel');
  },
  error: null,
  saveFactor: function () {

    var fctr = this.get('factor');

    var self = this;

    var dataset = self.get('dataset_id');

    let factor_type = this.get('factor_type');
    let factor_name = this.get('factor_name');
    let factor_data_type = this.get('factor_data_type');
    let factor_better_direction = this.get('factor_better_direction');
    let factor_description = this.get('factor_description');
    let factor_group = this.get('factor_group');
    let factor_tablename = this.get('factor_tablename');
    let factor_calculation_type = this.get('factor_calculation_type');
    let factor_calculation_num = this.get('factor_calculation_num');
    let factor_calculation_denom = this.get('factor_calculation_denom');
    let factor_calculation_mapper = this.get('factor_calculation_mapper');
    let factor_calculation_reducer = this.get('factor_calculation_reducer');
    let factor_calculation_colname = this.get('factor_calculation_colname');
    this.set('error', null);
    this.set('saveText', null);

    if (!factor_type) {
      this.set('error', "Error saving. Please refresh and try again.");
      return;
    }
    if (!factor_name || !factor_data_type || !factor_calculation_type ||
      (factor_calculation_type === 'Column' && !factor_calculation_colname) ||
      (factor_calculation_type === 'Ratio' && (!factor_calculation_num || !factor_calculation_denom)) ||
      (factor_calculation_type === 'Function' && (!factor_calculation_mapper || !factor_calculation_mapper))) {
      this.set('error', "Missing fields. Please complete the form.");
      return;
    }
    if (!fctr) {
      fctr = this.get('store').createRecord(factor_type, {
        type: factor_type,
        datasetId: dataset,
        namespace: 'Local'
      });
    }
    fctr.set('name', factor_name);
    fctr.set('dataType', factor_data_type.data_type);
    fctr.set('unitType', factor_data_type.unit_type);

    fctr.set('betterDirection', factor_better_direction);
    fctr.set('description', factor_description);
    fctr.set('group', factor_group);


    if (fctr.get('status') === 'green') {
      let status = 'green';
      if (factor_calculation_type !== fctr.get('calculation.type')) {
        status = 'yellow';
      }

      if (factor_calculation_type === 'Ratio' && factor_calculation_num &&
        (!fctr.get('calculation.numerator') || factor_calculation_num.name !== fctr.get('calculation.numerator').name)) {
        status = 'yellow';
      }
      if (factor_calculation_type === 'Ratio' && factor_calculation_denom &&
        (!fctr.get('calculation.denominator') && factor_calculation_denom.name !== fctr.get('calculation.denominator').name)) {
        status = 'yellow';
      }

      if (factor_calculation_type === 'Simple' && factor_calculation_colname &&
        factor_calculation_colname !== fctr.get('calculation.colname')) {
        status = 'yellow';
      }
      if (factor_calculation_type === 'Function' && factor_calculation_mapper &&
        factor_calculation_mapper !== fctr.get('calculation.mapper')) {
        status = 'yellow';
      }

      if (factor_calculation_type === 'Function' && factor_calculation_reducer &&
        factor_calculation_reducer !== fctr.get('calculation.reducer')) {
        status = 'yellow';
      }
      fctr.set('status', status);
    }
    if (!fctr.get('calculation')) {
      fctr.set('calculation', {});
      fctr.set('status', 'yellow');
    }

    if( factor_calculation_type == 'Advanced' ){
      fctr.set('calculation._cls', 'AdvancedCalculation');
      fctr.set('calculation.type', 'Advanced');
    }else{
      fctr.set('calculation._cls', 'Calculation');
      fctr.set('calculation.type', factor_calculation_type);
      fctr.set('calculation.tablename', factor_tablename);
      fctr.set('calculation.numerator', factor_calculation_num);
      fctr.set('calculation.denominator', factor_calculation_denom);
      fctr.set('calculation.colname', factor_calculation_colname);
      fctr.set('calculation.mapper', factor_calculation_mapper);
      fctr.set('calculation.reducer', factor_calculation_reducer);
      if (factor_calculation_type === 'Ratio' && factor_data_type.data_type === 'rate') {
        fctr.set('calculation.ratio_type', 'Rate');
      }
      let calculation = fctr.get('calculation');
      try {
        if (calculation.numerator) {
          fctr.set('calculation.numerator', calculation.numerator.toJSON({includeId: true}));
        }
      } catch (err) {
      }
      try {
        if (calculation.denominator) {
          fctr.set('calculation.denominator', calculation.denominator.toJSON({includeId: true}));
        }
      } catch (err) {
      }

      fctr.set('calculation', calculation);

      if (!calculation.type) {
        fctr.set('calculation.type', "Column");
      }
    }

    var saveAction = self.get('saveComplete');

    self.set('saveText', "Saving...");
    let _this = this;
    var onSuccess = function (m) {
      self.set('factor', m);
      self.set('saveText', "Saved at " + moment().calendar());
      if (saveAction) {
        saveAction(m.get('id'));
      }
      _this.sendAction('save');
      self.cancelFactor();
      self.set('showChart', true);
    };
    var onFail = function (error) {
      console.log(error);
      self.set('error', error);
      self.set('showChart', true);
    };
    self.set('showChart', false);
    fctr.save().then(onSuccess, onFail).catch(function (reason) {
      console.log(reason);
      self.set('error', reason);
      self.set('showChart', true);
      self.cancelFactor();
    });
  },
  metricsArr: function () {
    var ms = this.get('metrics');

    var marr = Ember.A([]);
    if (!ms) {
      return marr;
    }
    ms.forEach(function (m) {
      marr.pushObject(m);
    });
    return marr;
  }.property('metrics'),
  dimensionsArr: function () {
    var ms = this.get('dimensions');
    var marr = Ember.A([]);
    if (!ms) {
      return marr;
    }
    ms.forEach(function (m) {
      marr.pushObject(m);
    });
    return marr;
  }.property('dimensions'),
  didInsertElement: function () {
    //$('.dropdown').dropdown();
  },
  deleteText: "Delete",

  actions: {
    cancel: function () {
      this.cancelFactor();
    },
    save: function () {
      this.saveFactor();
    },
    addCalculation: function () {
      this.set('factor.calculation', {'type': 'Function'});
    },
    deleteFactor: function () {
      var fctr = this.get('factor');
      if (!fctr || !fctr.type || !fctr.id) {
        return;
      }
      var _this = this;
      if (fctr.id) {
        var self = this;
        self.set('deleteText', "Deleting...");
        fctr.destroyRecord().then(function () {
          self.set('deleteText', "Deleted");
          _this.transitionToRoute('schema');
        }, function (error) {
          console.log(error);
          self.set('deleteText', "(Error) Delete");
        });
      }
    },
    setCompare: function () {

    },
    setPoint: function () {

    }
  }
});
