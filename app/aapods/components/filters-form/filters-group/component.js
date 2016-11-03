import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

Ember.Application.filterFormsComponent = Ember.Component.extend({
  selectedDimension: null,
  tagName: '',
  dimensionsFilter: [],
  selectedFilterValue: null,
  oldFilters: null,

  didInsertElement: function () {

    const parentId = '#' + $(this)[0].parentView.elementId;
    Ember.run.once(this, ()=> {
      Ember.$(parentId).find('.filters' + this.get('filter.filter_id')).find('.filterDimension').dropdown('set selected', this.get('filter.dimsId'));
      this.set('selectedDimension', this.get('filter.dimsId'));
      let type = this.get('filter.filterType');
      if (this.get('filter.values').length > 1) {
        type = ',,';
      }
      this.set('oldFilters', this.get('filter'));
      this.addObserver("dimensionsValues", this.preFillDimensionsValues);
      setTimeout(()=> {
        Ember.$(parentId).find('.filters' + this.get('filter.filter_id')).find('.filters').dropdown('set selected', type);
        this.set('filterType', type);
      }, 15);
    });
  },
  preFillDimensionsValues: function () {
    const parentId = '#' + $(this)[0].parentView.elementId;
    setTimeout(()=> {
      let values;
      if (this.get('filter.values').length > 1) {
        values = this.get('filter.values').map((x)=>encodeURI(x));
      } else {
        values = encodeURI(this.get('filter.values')[0]);
      }
      Ember.$(parentId).find('.filters' + this.get('filter.filter_id')).find('.dimensionValues').dropdown('set selected', values);
      this.removeObserver("dimensionsValues", this.preFillDimensonsValues);
      this.addObserver('selectedFilterValue', this.changeFilter);
      this.changeFilter();
    }, 15);
  },

  dimensionsValues: [],
  filterTypes: [
    {name: 'is', value: '=='},
    {name: 'is one of', value: ',,'},
    {name: 'is not', value: '!='},
    {name: 'greater than', value: ">>"},
    {name: 'less than', value: "<<"},
    {name: 'greater or equal', value: ">="},
    {name: 'less or equal', value: "<="}],

  filterType: null,
  loadingDimensionValues: false,
  getDimensionsValues: function () {
    let sd = this.get('selectedDimension');
    if (sd) {
      this.set('loadingDimensionValues', true);
      Ember.$.get(ENV.api_endpoint + '/schema/values/' + sd + '/')
        .then((dvs)=> {
          let dimensionsValues = null;
          if (dvs) {
            dimensionsValues = dvs.map((dim)=> {
              return {name: dim, value: encodeURI(dim)};
            });
          }
          if (sd === this.get('selectedDimension')) {
            this.set('dimensionsValues', dimensionsValues);
            this.set('selectedFilterValue', null);
            this.set('loadingDimensionValues', false);
          }

        });
    } else {
      this.set('dimensionsValues', null);
      this.set('selectedFilterValue', null);
    }
  },

  dimensionsValuesList: function () {
    return this.get('dimensionsValues');
  }.property('dimensionsValues'),


  changeFilter: function () {
    if (this.selectedFilterValue && this.selectedDimension) {
      const dimsName = this.get('dimensions').filter((obj)=>obj.id === this.selectedDimension)[0].get('name');
      const filterType = this.get('filterType') === ',,' ? "==" : this.get('filterType');
      const filter = {
        dimsName: dimsName,
        dimsId: this.selectedDimension,
        filterType: filterType,
        filter_id: this.get('filter_id'),
        values: this.get('selectedFilterValue').split(',')
      };
      const old = this.get('oldFilters');
      let current = this.get('parentFilters').findBy('filter_id', old.filter_id);
      for (let key in filter) {
        if (key !== 'filter_id') {
          Ember.set(current, key, filter[key]);
        }
      }
      this.set('oldFilters', filter);
    }
  },

  actions: {
    removeFilter: function (id) {
      this.get('removeFilter')(id);
    },
    updateSelectedDimension: function (component, none, value, item) {
      const parentId = '#' + $(this)[0].parentView.elementId;
      const id = $(item).attr("data-id");
      if (this.get('selectedDimension') === id) {
        return;
      }
      this.set('selectedDimension', id);
      this.getDimensionsValues();
      setTimeout(()=> {
        Ember.$(parentId).find('.filters' + this.get('filter.filter_id')).find('.filters').dropdown('set selected', '==');
      }, 10);
      this.set('selectedFilterValue', null);
    },
    updateSelectedDimensionHide: function () {
      setTimeout(()=> {
        document.activeElement.blur();
      }, 100);
    },
    updateSelectedFilter: function (component, none, value, item) {
      const id = $(item).attr("data-id");
      this.set('filterType', id);
      if (id === ',,') {
        this.set('multiple', true);
      } else {
        this.set('multiple', false);
      }
      this.set('selectedFilterValue', null);
    },
    updateSelectedFilterHide: function () {
      setTimeout(()=> {
        document.activeElement.blur();
      }, 100);
    },
    updateSelectedValue: function (component, allValue) {
      this.set('selectedFilterValue', allValue);
    },
    updateSelectedValueHide: function () {
      setTimeout(()=> {
        document.activeElement.blur();
      }, 100);
    }

  }

});


export default Ember.Application.filterFormsComponent;
