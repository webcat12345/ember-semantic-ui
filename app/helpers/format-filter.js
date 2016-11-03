import Ember from 'ember';

export function formatFilter(fltr_dims) {
  const [fltr,dims, funnels] = fltr_dims;
  if (!fltr) {
    return "For all users";
  }
  const filters_array = fltr.split(';');
  const formated_filter = filters_array.map((x)=> {
    let prefix = '';
    if (x.indexOf('INDIRECT') === 0) {
      const start = x.indexOf('|');
      const end = x.indexOf(')');
      if (!start || !end) {
        return;
      }
      prefix = "Users who came back in ";
      x = x.substr(start + 1, end - start - 1);
    }

    if (x.indexOf('==') >= 0) {
      const [dim_id, value] = x.split('==');
      const dim = dims.findBy('id', dim_id);
      if (dim) {
        return prefix + dim.get('name') + " <b>is</b> " + value;
      }else{
        const funnel = funnels.findBy('id', dim_id);
        if (funnel) {
          return prefix + 'Completed Funnel ' + funnel.get('name') + ' ' ;
        }
      }

    } else if (x.indexOf('>=') >= 0) {
      const [dim_id, value] = x.split('>=');
      const dim = dims.findBy('id', dim_id);
      if (dim) {
        return prefix + dim.get('name') + " <b>is greater or equal</b> " + value;
      }

    } else if (x.indexOf('<=') >= 0) {
      const [dim_id, value] = x.split('<=');
      const dim = dims.findBy('id', dim_id);
      if (dim) {
        return prefix + dim.get('name') + " <b>is less or equal</b> " + value;
      }
    } else {

    }

  }).join(' and ');
  return new Ember.Handlebars.SafeString(formated_filter);
}

export default Ember.Helper.helper(formatFilter);
