/**
 * Created by maurinlenglart on 3/31/16.
 */
import Ember from 'ember';

export default Ember.Service.extend({
  _dashboards: {},
  needs: ['adhocwhyexists-modal'],
  showModal: function (name, content) {
    adhocwhy.set('model', content);
    this.render(name, {
      into: 'application',
      outlet: 'modal',
      controller: modalController
    });
  },
  removeModal: function () {
    this.disconnectOutlet({
      outlet: 'modal',
      parentView: 'application'
    });
  }
});
