import Ember from 'ember';
import ENV from 'datasenseui/config/environment'
export default Ember.Service.extend({
	getStatus(self, dataset_id, metric_id, factor_id, fltr, sd, ed,a,b, dimids){
		self.set('loading', true);
    var _this = self;
    debugger;
    return Ember.$.get(ENV.api_endpoint + '/pattern/whyStatus/', {
        dataset_id: dataset_id,
        metric_id: metric_id,
        factor_id: factor_id,
        filter: fltr,
        start_date: sd,
        end_date: ed,
        a: a,
        b: b,
        dimension_ids: dimids
      }).then(function (data) {
      	let whydone = false;
        if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
          debugger;
          _this.set('loading', false);
          data['metric_id'] = metric_id;
          data['a'] = a;
          data['b'] = b;
          data['fltr'] = fltr;
          data['factor_id'] = factor_id;
          data['sd'] = sd;
          data['ed'] = ed;
          data['dataset_id'] = dataset_id;
          if (data['percent'] >= 90.0){
          	debugger;
          	whydone = true;
          }
          else{
            //show modal
            if(data['adhocwhy_exist'] == 1){
                 _this.send("showModal","adhocwhyexists-modal",data);
            }
            else{
              if(data['requests'] <= 0){
                 _this.send("showModal","adhocwhyexceeded-modal",data);
              }
              else{
                  _this.send("showModal","adhocwhy-modal",data);
              }
          }
        }

      }
      return whydone;
    }, function (error) {
        _this.set('loading', false);
        console.log(error);
      }
    );
}
});
