import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  needs: "application",
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
  saveText: "Save",
  isGA: Ember.computed.equal('model.type', 'Google Analytics'),
  isOMF: Ember.computed.equal('model.type', 'Omniture Feed'),
  isMixpanel: Ember.computed.equal('model.type', 'Mixpanel'),
  isMySql: Ember.computed.equal('model.type', 'MySql'),
  isS3: Ember.computed.equal('model.type', 'S3'),
  isFile: Ember.computed.equal('model.type', 'File'),
  isCSFTP: Ember.computed.equal('model.type', 'CSFTP'),
  s3buckets: null,
  s3objects: null,
  fileFormatChoices: ["JSON", "DELIMITED"],
  fileCompressionChoices: ["NONE", "GZIP"],
  s3ListBuckets: function () {
    let ak = this.get('model.awsAccessKeyId');
    let sak = this.get('model.awsSecretAccessKey');

    if (!ak || !sak) {
      return;
    }
    var self = this;
    Ember.$.get(ENV.api_endpoint + "/setup/s3/buckets", {ak: ak, sak: sak}).then(function (buckets) {
      self.set('s3buckets', buckets);
    }, function (reason) {
      console.log(reason);
    });
  },
  s3ListObjects: function () {
    let ak = this.get('model.awsAccessKeyId');
    let sak = this.get('model.awsSecretAccessKey');
    let b = this.get('model.bucket');
    let p = this.get('model.prefix');
    let d = this.get('model.dateFormat');
    if (!ak || !sak || !b) {
      return;
    }
    if (p && d) {
      p = p.replace(d, '');
    }
    var self = this;
    Ember.$.get(ENV.api_endpoint + "/setup/s3/objects", {
      ak: ak,
      sak: sak,
      b: b,
      p: p,
      limit: 20
    }).then(function (objects) {
      self.set('s3objects', objects);
    }, function (reason) {
      console.log(reason);
    });
  },
  initializeDictionary: function() {
    var model_info = this.get('model.dict_join_info');
    var cols;
    if (! model_info) {
      this.set('model.dict_join_info', {'join_columns':[
      {parent_col: "--", dictionary_col: "--"},
      {parent_col: "--", dictionary_col: "--"},
      {parent_col: "--", dictionary_col: "--"},
      {parent_col: "--", dictionary_col: "--"},
      {parent_col: "--", dictionary_col: "--"}
      ]});
      return;
    }
    cols = Ember.get(model_info,'join_columns')
    if (!cols) {
        cols = [];
    }

    var num_cols = cols.length;
    if (num_cols < 5) {
        for (let i=num_cols; i < 5; i++){
            cols.push(  {parent_col: "--", dictionary_col: "--"})
        }
        Ember.set(model_info, 'join_columns', cols);
    }
  }.observes('model.dict_join_info'),
  actions: {
    save: function () {
      this.set('saveText', 'Saving');
      var self = this;
      var onSuccess = function (source) {
        self.set('saveText', 'Saved');
        self.transitionToRoute('source', source);
      };
      var onFail = function (error) {
        self.set('saveText', '(Error) Save');
        console.log(error);
      };
      this.get('model').save().then(onSuccess, onFail);
    },
    s3getbuckets: function () {
      this.s3ListBuckets();
    },
    s3getobjects: function () {
      this.s3ListObjects();
    }
  }
});

