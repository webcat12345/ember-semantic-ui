import Ember from 'ember';
import ENV from 'datasenseui/config/environment';


export default Ember.Component.extend({
  tagName: 'div',
  selectedFilterType: null,
  selectedDimensionValue: null,
  multiple: false,
  filterTypes: [
    {name: 'is', value: '=='},
    {name: 'is one of', value: ',,'},
    {name: 'is not', value: "!="},
    {name: 'is greater than', value: ">>"},
    {name: 'is lower than', value: "<<"},
    {name: 'is greater or equal', value: ">="},
    {name: 'is lower or equal', value: "<="}
  ],
  dimensionValues: function () {
    Ember.run.schedule("afterRender", this, function () {
      this.dimensionsValues();
      this.$('.filters').dropdown('set selected', 'is');
    });
  }.on('init'),


  dimensionsValues: function () {
    this.$('.dimensionsValues')
      .dropdown({
        onChange: (value, text) => {
          if (this.get('multiple')) {
            this.set('selectedDimensionValue', decodeURIComponent(value.replace(/,/g, ',,')));
          } else {
            this.set('selectedDimensionValue', decodeURIComponent(value));
          }
        },
        saveRemoteData: false,
        apiSettings: {
          url: ENV.api_endpoint + '/schema/search/' + this.get('dataset_id') + '/' + this.get('filter.dimsId') + '/?query={query}&limit=100',
          onResponse: function (results) {
            const choices = [];
            for (const key in results) {
              if (!isNaN(key)) {
                const value = results[key];
                const name = value[2];
                choices.push({
                  name: "<i>" + name + "</i>",
                  value: encodeURIComponent(name)
                });
              }
            }
            return {
              "success": true,
              "results": choices
            };
          }
        }
      });
    if (this.get('filter.values').length > 0 && this.get('filter.values')[0] && this.get('filter.values')[0] !== "") {
      this.$('.dimensionsValues').dropdown('set value', this.get('filter.values')[0]);
      this.$('.dimensionsValues').dropdown('set text', this.get('filter.values')[0]);
    } else {
      this.$('.dimensionsValues').dropdown('set placeholder text', 'Pick a value');
    }
  },


  updateFilter: function () {
    this.set('filter.filterType', this.get('selectedFilterType.value'));
    this.set('filter.values', [this.get('selectedDimensionValue')]);
  }.observes('selectedFilterType', 'selectedDimensionValue'),

  isMultiple: function () {
    if (this.get('filter.filterType') && this.get('old_filter_type') !== this.get('filter.filterType')) {
      this.set('filter.values', []);
      this.set('selectedDimensionValue', undefined);

      this.set('old_filter_type', this.get('filter.filterType'));
      setTimeout(()=> {
        this.$('.dimensionsValues').dropdown('set value', "");
        this.$('.dimensionsValues').dropdown('set text', "Pick a value");
        this.dimensionsValues();
      }, 1);
      this.set('multiple', this.get('filter.filterType') === ',,');
    }
  }.observes('filter.filterType'),

  actions: {
    removeFilter: function (id) {
      this.get('removeFilter')(id);
    }
  }
});
