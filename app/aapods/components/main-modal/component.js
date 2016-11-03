import Ember from 'ember';

export default Ember.Component.extend({
  closeText: 'No',
  okText: 'Yes',
  okButtonText: 'Ok',
  showFooter: true,
  showButtons: false,
  showHeader: true,
  showOkButton: false,
  requests: null,

  actions: {
    close: function () {
      $('.modal').modal('hide');
      this.sendAction('close');
    },
    ok: function () {
      $('.modal').modal('hide');
      this.sendAction('ok');
    }
  },
  show: function () {
    this.$('.modal').modal({
      onHidden: function () {
        this.sendAction('close');
      }.bind(this)
    }).modal('show');

  }.on('didInsertElement')
});
