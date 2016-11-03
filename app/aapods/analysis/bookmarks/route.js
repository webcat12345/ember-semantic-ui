import Ember from 'ember';


export default Ember.Route.extend({
  model: function () {
    let ds = this.modelFor('datasetroot');
    let query = {dataset_id: ds.dataset_id, method: "bookmarks"};
    return this.store.query('story', query);
  },
  actions: {
    reloadModel: function () {
      this.refresh();
    }
  }
});
