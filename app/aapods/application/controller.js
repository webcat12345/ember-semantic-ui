import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  init: function () {
    Ember.$(document).ajaxError((event, jqXHR) => {
      this.set('error', JSON.stringify(jqXHR));
    });
    this.set('server', ENV.api_endpoint);
    // $('[data-toggle="popover"]').popover({
    //   container: 'body'
    // });
  },
  server: null,

  error: null,
  dataset_id: null,
  dataset: null,
  user: null,
  showSearch: function () {
    //var cp = this.get('currentPath');
    //return cp !== 'dataset.index' && cp !== 'index';
    return false;
  }.property('currentPath'),

  showBrand: function () {
    var cp = this.get('currentPath');
    return cp !== 'datasetroot.index' && cp !== 'index';
  }.property('currentPath'),

  showNav: function () {
    var cp = this.get('currentPath');
    return cp !== 'login';
  }.property('currentPath'),

  isAdmin: Ember.computed.bool('user.is_staff'),
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

  navbarType: function () {
    var cp = this.get('currentPath');
    if (cp === 'datasetroot.index' && cp !== 'index') {
      return 'navbar-white';
    }
    return 'navbar-default';
  }.property('currentPath'),

  q: null,
  searchWarn: false,


  messageSuccess: null,
  messageError: null,
  setMessage: function (messageType, message) {
    if (messageType === 'success') {
      this.set('messageSuccess', message);
    } else if (messageType === 'error') {
      this.set('messageError', message);
    }
    setTimeout(()=> {
      this.set('messageSuccess', null);
      this.set('messageError', null);
    }, 5000);
  },

  base_features: null,
  toggle_features: function () {
    for (let flag in this.features._flags) {
      this.features._flags[flag] = !this.features._flags[flag];
    }
  }.observes('features_flag'),
  actions: {

    dismissMessage: function (messageType) {
      if (messageType === 'success') {
        this.set('messageSuccess', null);
      } else if (messageType === 'error') {
        this.set('messageError', null);
      }
    },
    search: function () {
      var query = this.get('q');
      if (query) {
        this.transitionToRoute("chart", query);
      } else {
        this.set('searchWarn', true);
      }
    },
    dismissError: function () {
      this.set('error', null);
    },
    error: function (error) {
      console.log('error in application controller', error);
    },
    changeServer: function () {
      var s = this.get('server');
      if (s !== ENV.api_endpoint) {
        ENV.api_endpoint = s;
        this.transitionToRoute('login');
      }
    }
  }
});

