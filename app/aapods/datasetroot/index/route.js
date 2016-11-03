import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function () {

    const dataset = this.modelFor('datasetroot');
    //todo remove dataset specific code
    if (dataset.dataset_id === "thredup_sessions") {
      return this.transitionTo('apps.funnel');
    } else if (dataset.dataset_id === "platform9") {
      return this.transitionTo('apps.funnel');
    } else if (dataset.dataset_id === "whoeasy") {
      return this.transitionTo('channels');
    }

//end of dataset specific

    if (!dataset.dataset_id && dataset.datasets && dataset.datasets.length > 0) {
      this.transitionTo('datasets');
    } else {
      this.store.query('source', {dataset_id: dataset.dataset_id}).then((sources) => {
        if (sources.get("length") <= 0) {
          this.transitionTo('sources');
        } else {
          this.transitionTo('chart');
        }
      }, (error)=> {
        console.log(error);
        this.transitionTo('chart');
      });
    }
  }
});
