import Ember from 'ember';


export default Ember.Component.extend({
  _filters: Ember.A([]),
  classNames: ['padded', 'row', 'explore--main-row'],
  tagName: 'div',
  filters_query: null,
  default_text: "All sessions",

  set_choices: function () {
    if (this.get('current_filters') && this.get('current_filters').length !== 0) {

      this.set('_filters', this.get('current_filters'));
      this.get('_filters').forEach((x)=> {
        let dim = this.get('dimensions').findBy('id', x.dimsId);
        if (dim) {
          Ember.set(x, 'dimsName', dim.get('name'));
        }
      });
    } else if (!this.get('filters_query')) {
      this.set('_filters', Ember.A([]));
      this.send('addFilter');
    }
  }.on('init'),

  set_filters_from_query: function () {
    const f = this.get('filters_query') || '';
    const filters = [];
    if (f === '' || f === 'rest') {
      return f;
    }
    f.split(';').forEach((filter, idx)=> {
      const filterObject = {
        dimsId: filter.substring(0, 24),
        filterType: filter.substring(24, 26),
        values: [],
        filter_id: idx,
        dimsName: this.get('dimensions').findBy('id', filter.substring(0, 24)).get('name')
      };
      filter.split(',,').forEach((filterValue)=> {
        filterObject.values.push(filterValue.substring(26, filterValue.length));
      });
      filters.push(filterObject);
      this.get('name');
    });

    this.set('_filters', filters);
  }.on('init'),

  filters_to_query: function () {
    const filters = this.get('_filters').filter((x)=>x.values[0] !== '' || !x.values[0]);
    const filter = filters.map((filter)=> {
      return filter.values.map((filterValues)=> {
        //todo this is a quick fix but we need to investigate why filterType is null
        if (!filter.filterType) {
          Ember.set(filter, 'filterType', "==");
        }
        return filter.dimsId + filter.filterType + decodeURI(filterValues);
      }).join(',,');
    }).join(';');


    this.set('filters_query', filter);
  }.observes('_filters.@each.values.@each'),

  actions: {
    addFilter: function () {

      const filtersIds = this.get('_filters').map((x)=>x.filter_id);
      let id = 0;
      if (filtersIds.length !== 0) {
        id = Math.max(...filtersIds) + 1;
      }

      this.get('_filters').addObject({
        dimsId: '',
        filterType: '==',
        values: [],
        filter_id: id
      });
    },
    removeFilter: function (id) {
      const filter = this.get('_filters').findBy('filter_id', id);
      const filterObjectIdx = this.get('_filters').indexOf(filter);
      if (filterObjectIdx !== -1) {
        this.get('_filters').removeAt(filterObjectIdx);
      }
    }
  }
});

