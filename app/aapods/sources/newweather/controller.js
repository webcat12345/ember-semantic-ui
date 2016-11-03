import Ember from 'ember';

export default Ember.Controller.extend({
  table_name: null,
  column_name: null,

  disableAdd: function () {
    return !(this.get('name')) && !(this.get('table_name') && this.get('column_name'));
  }.property('name', 'table_name', 'column_name'),

  actions: {
    createsource: function () {
      const weatherSource = this.store.createRecord('weathersource', {
        datasetId: this.get('model.dataset_id'),
        name: this.get('name'),
        table_name: this.get('table_name'),
        column_name: this.get('column_name')
      });

      const onSuccess = function (weatherSource) {
        this.transitionToRoute('source', weatherSource);
      }.bind(this);

      const onFail = function (error) {
        console.log(error);
      };
      weatherSource.save().then(onSuccess, onFail);
    }
  }
});

