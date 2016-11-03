import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export function parseFilters(fltr) {
  if (!fltr) {
    return [];
  }
  const myf = fltr || '';
  const filters = [];
  myf.split(';').forEach((filter, idx)=> {
    let filterObject = {dimsId: filter.substring(0, 24), filterType: filter.substring(24, 26), values: [], filter_id: idx};
    filter.split(',,').forEach((filterValue)=> {
      filterObject.values.push(filterValue.substring(26, filterValue.length));
    });
    filters.push(filterObject);
  });
  return filters;
}
export function compileFilters(filters_filtered) {
  return filters_filtered.map((filter)=> {
    return filter.values.map((filterValues)=> {
      return filter.dimsId + filter.filterType + decodeURI(filterValues);
    }).join(',,');
  }).join(';');
}
