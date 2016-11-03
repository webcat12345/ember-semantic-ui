import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Service.extend({
  _compare: {},
  get_compare: function (params) {

    // remove null valued params to minimize URL length
    for (var key in params) {
      if (params[key] === null) {
        delete params[key];
      } else if (key === 'params') {
        for (var k in params[key]) {
          if (params[key][k] === null) {
            delete params[key][k]
          }
        }
      }
    }

    const id = JSON.stringify(params);

    return new Promise((resolve)=> {
      if (this.get('_compare')[id] === 'doing_call') {
        return setTimeout(()=> {
          return resolve(this.get_compare(params));
        }, 50);
      } else if (this.get('_compare')[id]) {
        return resolve(this.get('_compare')[id]);
      } else {
        this.get('_compare')[id] = 'doing_call';
        return Ember.$.get(ENV.api_endpoint + '/pattern/compare/', {params: id})
          .then((data)=> {
            this.get('_compare')[id] = data;
            return resolve(data);
          });
      }
    });
  }
});
