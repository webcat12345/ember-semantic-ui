import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  model: function () {
    return {datasets: []};
  },
  afterModel: function () {
    document.title = "Cuberon - Customer Intelligence Platform ";
  },
  actions: {
    showModal: function (name, content) {
      name = 'components/modals/' + name;
      const modalController = this.controllerFor(name);
      modalController.set('model', content);
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
    },
    didTransition: function () {
      this.controller.set('error', null);
      return true; // Bubble the didTransition event
    }
  }
});
