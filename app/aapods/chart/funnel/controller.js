import Ember from 'ember';
import ChartController from '../mixin';

export default Ember.Controller.extend(ChartController, {
  groupByValuesOnly: true,
  qp_params: null,

  initParams: function () {
    this.set('qp_params', {
      steps: this.get('qsd.steps')
    });
  }.observes('qsd'),
  saveString: "Save",
  actions: {
    addFunnel: function () {
      let newf = this.store.createRecord('funnel', {datasetId: this.get('model.dataset_id'), steps: Ember.A(['true'])});
      this.set('qsd', newf);
      $('.ui.accordion').accordion('open', 0);
    },
    addStep: function () {
      let f = this.get('qsd');
      if (f) {
        f.addStep();
      }
    },
    removeStep: function (index) {
      let f = this.get('qsd');
      if (f) {
        f.removeStep(index);
      }
    },
    redraw: function () {
      this.initParams();
      this.send('draw');
    },
    saveFunnel: function () {
      let f = this.get('qsd');
      let _this = this;
      _this.set('saveString', 'Saving...');
      f.save().then(function (done) {
        _this.set('saveString', "Saved");
        let p = _this.getParams();
        p.sd = done.get('id');
        _this.transitionTo({queryParams: p});
        _this.send('reload');
        $('.ui.accordion').accordion('close', 0);
      }, function (error) {
        _this.set('saveString', 'Error Saving! Try Again');
      });
    },
    addStepFilter: function (step) {
      const filters_ids = step.get('filters').map((x)=>x.filter_id).sort();
      let id = 0;
      if (filters_ids.length !== 0) {
        id = filters_ids[filters_ids.length - 1] + 1;
      }
      step.get('filters').addObject({dimsId: '', filterType: '', values: [], filter_id: id});
    },
    removeStepFilter: function (step, id) {
      const filter = step.get('filters').findBy('filter_id', id);
      const filterObjectIdx = step.get('filters').indexOf(filter);
      if (filterObjectIdx !== -1) {
        step.get('filters').removeAt(filterObjectIdx);
      }
    }
  }
});

