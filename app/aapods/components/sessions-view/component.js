import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Component.extend({
  sampleSessions : null,
  loadingSessions: null,
  fetchSessions: function () {
    this.set('loadingSessions', true);
    const dimids = this.get('sessionModel.dimids');

    if(!dimids){
      this.set('loadingSessions', false);
      return;
    }

    const payload = {
      dataset_id: this.get('sessionModel.dataset_id'),
      filter: this.get('sessionModel.filters'),
      start_date: this.get('sessionModel.start_date'),
      end_date: this.get('sessionModel.end_date'),
      dimids: dimids.join(','),
      topN: 10
    };
    this.set('loadingSessions', true);
    this.title = "Session samples for :" + this.get('sessionModel.name');
    Ember.$.post(ENV.api_endpoint + "/schema/sample_sessions/", {params:JSON.stringify(payload)}).then((result)=> {
      this.set('loadingSessions', false);
      this.set('sampleSessions', result);
      if( result ){
        this.set('dims', Object.keys(result[0]));
      }
    });
  }.observes('sessionModel'),
});
