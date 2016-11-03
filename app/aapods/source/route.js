import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    const ds = this.modelFor('datasetroot');
    const user = this.modelFor('loggedin');
    if (params.source_id.startsWith('new')) {
      if (params.source_id === "newga") {
        return this.store.createRecord('gasource', {
          datasetId: ds.dataset_id,
          type: "Google Analytics",
          userWithCredentials: user.username
        });
      } else if (params.source_id === "newomf") {
        return this.store.createRecord('omfsource', {
          datasetId: ds.dataset_id,
          type: "Omniture Feed",
          hitsFile: "hit_data.tsv",
          headerFile: "column_headers.tsv"
        });
      } else if (params.source_id === "newmp") {
        return this.store.createRecord('mixpanelsource', {datasetId: ds.dataset_id, type: "Mixpanel"});
      } else if (params.source_id === "newmysql") {
        return this.store.createRecord('mysqlsource', {datasetId: ds.dataset_id, type: "MySql"});
      } else if (params.source_id === "newfile") {
        return this.store.createRecord('filesource', {datasetId: ds.dataset_id, type: "File", compression: "NONE"});
      } else if (params.source_id === "news3") {
        return this.store.createRecord('s3source', {datasetId: ds.dataset_id, type: "S3", compression: "NONE"});
      } else if (params.source_id === "newCSFTP") {
        return this.store.createRecord('cuberonsftpsource', {datasetId: ds.dataset_id, type: "CSFTP"});
      } else {
        throw new Error("Invalid Source");
      }
    } else {
      return this.store.findRecord('source', params.source_id).then((model)=> {
        const src = model;
        if (src.get('type') === "Google Analytics") {
          return this.store.findRecord('gasource', src.get('id'));
        } else if (src.get('type') === "Omniture Feed") {
          return this.store.findRecord('omfsource', src.get('id'));
        } else if (src.get('type') === "Mixpanel") {
          return this.store.findRecord('mixpanelsource', src.get('id'));
        } else if (src.get('type') === "MySql") {
          return this.store.findRecord('mysqlsource', src.get('id'));
        } else if (src.get('type') === "File") {
          return this.store.findRecord('filesource', src.get('id'));
        } else if (src.get('type') === "S3") {
          return this.store.findRecord('s3source', src.get('id'));
        } else if (src.get('type') === "CSFTP") {
          return this.store.findRecord('cuberonsftpsource', src.get('id'));
        } else {
          return src;
        }
      }, function (error) {
        console.log(error);
      });
    }
  },
  setupController: function (controller, model) {
    controller.set("model", model);
    controller.set("saveText", "Save");
    controller.set('user', this.modelFor('loggedin'));
  }
});
