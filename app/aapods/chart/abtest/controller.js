import Ember from 'ember';
import ChartController from '../mixin';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend(ChartController, {
  type: 'area',
  qtype: 'area',
  compareMetric: null,

  getDimensionsValues: function () {
    if (this.selectedDimension) {
      Ember.$.get(ENV.api_endpoint + '/schema/dimensionsValues/' + this.selectedDimension + '/')
        .then((dimensionsValues)=> {
          dimensionsValues = dimensionsValues.map((dim)=> {
            return {name: dim, value: encodeURI(dim)};
          });
          this.set('dimensionsValues', dimensionsValues);
        });
    } else {
      this.set('dimensionsValues', null);
    }
  },

  ptsSelected: function () {
    return this.get('apt') && this.get('bpt');
  }.property('apt', 'bpt'),


  fetchDimensions: function () {
    var sm = this.get('qsm.id');
    var dataset_id = this.get('model.dataset.id');
    this.set('loadingDimensions', true);

    this.store.query('dimension', {dataset_id: dataset_id, cooccur: sm}).then((dims) => {
      this.set('dimensions', dims);
      this.get('dashboard');

      this.set('qsd', dims.filter((obj)=>obj.id === this.get('model.dashboard').get('date'))[0]);
      this.set("qstartDate", this.get('model.window.startDate'));
      this.set('qendDate', this.get('model.window.endDate'));

      this.set('loadingDimensions', false);
    }, (error)=> {
      console.log(error);
      this.set('loadingDimensions', false);
    });
  },
  processFetchDimensions: function () {
    if (this.get("qsm")) {
      Ember.run.once(this, 'fetchDimensions');
    }
  }.observes('qsm'),
  dimensionsDropdownClass: function () {
    return this.get('loadingDimensions') ? 'ui fluid search selection dropdown loading disabled' : 'ui fluid search selection dropdown';
  }.property('loadingDimensions'),

  actions: {
    updateSelectedFactor: function (component, id, value, item) {
      this.set('selectedDimension', id);
      this.set('group_by_object', this.get('dimensions').findBy('id', id));
      this.getDimensionsValues();
    },
    updateSelectedBaseline: function (component, id) {
      this.set('selectedBaseline', id);
    },
    updateSelectedVariation: function (component, id) {
      this.set('selectedVariation', id);
    },
    updateCompareMetric: function (component, id) {
      this.set('compareMetric', id);
      if (this.get('compareObject')) {
        const compare = this.get('compareObject');
        compare.metricId = this.get('compareMetric');
        this.set('compareObject', compare);
      }
    },
    setCompare: function (compare) {
      compare.metricId = this.get('compareMetric');
      //compare.sort = "combo_ab";
      this.set('compareObject', compare);
    }
  }

})
;

