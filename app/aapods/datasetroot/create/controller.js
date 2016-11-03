import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  newdataset: {
    connector_id: "file",
    "type": "ajax"
  },
  typeChoices: ["ajax", "csv"],
  connectorChoices: ["file", "omniture", "ga"],
  actions: {
    // display an error when logging in fails
    addDataset: function () {
      let dataset = this.get('newdataset');
      dataset.id = dataset.name;
      var ajax = ENV.api_endpoint + '/data/datasets';
      Ember.$.ajax({
        url: ajax,
        type: "POST",
        data: JSON.stringify(this.get('newdataset')),
        contentType: "application/json"
      }).then(function () {
        alert("dataset created");
        this.get('target.router').refresh();
      });
    },
    deleteDataset: function (datasetId) {
      var ajax = ENV.api_endpoint + '/data/dataset/' + datasetId + '/remove';
      Ember.$.ajax({url: ajax, type: "GET", contentType: "application/json"}).then(function () {
        alert("dataset deleted");
      });
    }
  }
});
