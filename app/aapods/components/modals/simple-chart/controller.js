import Ember from 'ember';

export default Ember.Controller.extend({
  size: "600px",
  actions: {
    modal: function (modal, data) {
      this.send('showModal', modal, data);
    },
    setPoint: function () {

    },
    setCompare: function () {

    }
  }
});

