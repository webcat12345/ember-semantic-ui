import Ember from 'ember';
import ENV from 'datasenseui/config/environment';


export default Ember.Component.extend({
  filters: Ember.A([]),
  classNames: ['padded', 'row'],
  filters_query: null,
  default_text: "All sessions",

  set_choices: function () {
    if (this.get('current_filters')) {
      this.set('filters', this.get('current_filters'));
      this.get('filters').forEach((x)=> {
        let dim = this.get('dimensions').findBy('id', x.dimsId);
        if (dim) {
          Ember.set(x, 'dimsName', dim.get('name'));
        }
      });
    } else if (!this.get('filters_query')) {
      this.set('filters', Ember.A([]));
    }
    Ember.run.schedule("afterRender", this, function () {
      this.$('.search_engine')
        .dropdown({
          onHide: ()=> {
            //using the onHide callback to allow use of arrows
            const value = this.get('value');
            const name = this.get('name');
            const filters_ids = this.get('filters').map((x)=>x.id).sort();
            let id = 0;
            if (filters_ids.length !== 0) {
              id = Math.max(...filters_ids) + 1;
            }
            const [dimsId,dimsName,dimsValue] = value.split('&&&');
            //function get called twice so we need that check:
            const exists = this.get('filters').filter((x)=> {
              return x.dimsId === dimsId && x.values[0] === dimsValue;
            });
            if (exists.length === 0 && dimsId) {
              this.get('filters').addObject({
                dimsId: dimsId,
                dimsName: dimsName,
                filterType: '==',
                values: [dimsValue],
                id: id
              });
              setTimeout(()=> {
                this.$('.search_engine').dropdown('clear');
                document.activeElement.blur();
              }, 10);
            }
            return true;
          },
          onChange: (value, name)=> {
            //using the onHide callback to allow use of arrows
            this.set('value', value);
            this.set('name', name);
            return false;
          },
          saveRemoteData: false,
          apiSettings: {
            url: `${ENV.api_endpoint}/schema/search/${this.get('dataset_id')}/?query={query}`,
            onResponse: function (results) {
              const choices = [];
              for (const key in results) {
                if (!isNaN(key)) {
                  const value = results[key];
                  const name = value[2] ? "<b>" + value[1] + "</b> : <i>" + value[2] + "</i>" : "<b>" + value[1] + "</b>";
                  choices.push({
                    name: name,
                    value: value.join('&&&')
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
    });
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
        id: idx,
        dimsName: this.get('dimensions').findBy('id', filter.substring(0, 24)).get('name')
      };
      filter.split(',,').forEach((filterValue)=> {
        filterObject.values.push(filterValue.substring(26, filterValue.length));
      });
      filters.push(filterObject);
    });
    this.set('filters', filters);
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
        id: idx,
        dimsName: this.get('dimensions').findBy('id', filter.substring(0, 24)).get('name')
      };
      filter.split(',,').forEach((filterValue)=> {
        filterObject.values.push(filterValue.substring(26, filterValue.length));
      });
      filters.push(filterObject);
    });
    this.set('filters', filters);
  }.on('init'),

  filters_to_query: function () {
    const filters = this.get('filters').filter((x)=>x.values[0] !== '' || !x.values[0]);
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
  }.observes('filters.@each.values.@each'),

  actions: {
    removeFilter: function (id) {
      const filter = this.get('filters').findBy('id', id);
      const filterObjectIdx = this.get('filters').indexOf(filter);
      if (filterObjectIdx !== -1) {
        this.get('filters').removeAt(filterObjectIdx);
      }
    }
  }
});

