import Ember from 'ember';

export default Ember.Controller.extend({
  name: null,
  dirPath: null,
  hitsFile: "hit_data.tsv",
  headerFile: "column_headers.tsv",

  disableAdd: function() {
    return !(this.get('dirPath') && this.get('name'));
  }.property('name', 'dirPath'),

  actions: {
    createsource: function() {
      var omfsource = this.store.createRecord('omfsource', {
        datasetId : this.get('model.dataset_id'),
        name : this.get('name'),
        inputPath: this.get('dirPath')
      });

      var self = this;
      var onSuccess = function(gasource) {
        self.transitionToRoute('source', gasource);
      };

      var onFail = function(error) {
        console.log(error);
      };
      omfsource.save().then(onSuccess, onFail);
    }
  }
});

