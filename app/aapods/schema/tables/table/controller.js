import Ember from 'ember';

export default Ember.Controller.extend({
  columnTypeChoices: ["Metric", "Dimension"],
  saveText: "Save All",
  confirmedSaveAll: false,
  saveColumn: function (col) {
    col.set('saveText', "Saving...");
    let dt = col.get('factor.data_type');
    if (dt === 'int') {
      col.set('factor.data_type', 'number');
    }
    var onSuccess = function () {
      col.set('saveText', "Save");
    };
    var onFail = function (error) {
      console.log(error);
      col.set('saveText', "(Error) Save");
    };
    col.save().then(onSuccess, onFail).catch(function (reason) {
      console.log(reason);
      col.set('saveText', "(Error) Save");
    });
  },
  actions: {
    saveColumn: function (c) {
      this.saveColumn(c);
    },
    saveAll: function () {
      var cols = this.get('model.columns');
      var self = this;
      cols.forEach(function (col) {
        self.saveColumn(col);
      });
    },
    changeType: function (col, type) {
      var of = col.get('factor');
      if (of && of.type === type) {
        return;
      }
      var newf = Ember.$.extend({}, of);
      newf.id = null;
      newf.type = type;
      if (newf._cls) {
        delete newf._cls;
      }
      col.set('factor', newf);
    }
  }
});

