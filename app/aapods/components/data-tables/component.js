import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  selectable: false,
  tableapi: null,

  didInsertElement: function () {
    var _this = this;
    var tid = this.get('tableid');
    var selectable = this.get('selectable');
    var config = {};
    var userconfig = this.get('config');
    if (userconfig) {
      config = Ember.$.extend({}, config, userconfig);
    }
    var table = this.$("#" + tid).dataTable();
    var btnid = this.get('btnid');
    var buttondiv = this.$('div.dataTables_wrapper > div.row').first().children();
    buttondiv.last().append(Ember.$('#' + btnid));

    if (selectable) {
      var tt = new Ember.$.fn.dataTable.TableTools(table, {
        "pageLength": 100,
        "iDisplayLength": 100,
        "sRowSelect": "multi",
        "aButtons": [
          "select_all",
          "select_none",
          {
            "sExtends": "collection",
            "sButtonText": "Save",
            "aButtons": ["csv", "xls", "pdf"]
          }
        ],
        fnRowSelected: function () {
          var aData = this.fnGetSelectedIndexes();
          var rowData = this.fnGetSelected();
          var row = Ember.$(rowData[0]).children('td');
          var rowText = [];
          for (var i = 0; i < row.length; i++) {
            rowText.push(Ember.$(rowData[0]).children('td')[i].textContent.trim().replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, ' '));
          }
          //alert(rowText);
          _this.set('selectedEntities', aData);
          _this.set('selectedRowText', rowText);
        },
        fnRowDeselected: function () {
          var aData = this.fnGetSelectedIndexes();
          _this.set('selectedEntities', aData);
        }
      });
      buttondiv.first().prepend(tt.fnContainer());
    }
    this.set('tableapi', table.api());
    this.filter();
  },
  filter: function () {
    var tableapi = this.get('tableapi');
    var filters = this.get('filters');

    if (!tableapi || !filters) {
      return;
    }
    for (let i = 0; i < filters.length; i++) {
      tableapi = tableapi
        .columns(filters[i].col)
        .search(filters[i].filter);
    }
    tableapi.draw();
  }.observes('filters')
});

