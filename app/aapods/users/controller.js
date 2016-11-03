import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Controller.extend({
  needs: ["application"],
  isAdmin: Ember.computed.readOnly("controllers.application.isAdmin"),
  new_password: null,
  user_selected: null,
  actions: {
    select_user: function (username) {
      this.set('success', false);
      this.set('errors', false);
      this.set('user_selected', this.get('model.users').findBy('username', username));
      this.set('new_password', null);
      setTimeout(()=> {
        const datasets_name = this.get('user_selected.datasets').map((x)=> x.name);
        $('.datasets').dropdown('clear');
        $('.datasets').dropdown('set selected', datasets_name);
      }, 1);

    },
    updateDatasets: function () {

    },
    new_user: function () {
      this.set('user_selected', {});
    },
    save: function () {
      this.set('disable', 'disabled');
      let values = $('.datasets').dropdown('get value');
      if (values === '') {
        values = [];
      } else {
        values = values.split(',');
      }

      const datasets = values.map((dataset)=>this.get('model.datasets').findBy('id', dataset));
      this.set('user_selected.datasets', datasets);
      if (this.get('new_password')) {
        this.set('user_selected.password', this.get('new_password'));
      }
      const user = JSON.stringify(this.get('user_selected'));
      Ember.$.post(ENV.api_endpoint + "/users/", user).then(()=> {
        this.set('disable', null);
        this.set('success', true);
      }, ()=> {
        this.set('disable', null);
        this.set('errors', true);
      });

    },

    delete_user: function () {
      const id = this.get('user_selected.id');
      this.set('user_selected', {});
      $.ajax({
        url: ENV.api_endpoint + "/users/" + id + '/',
        type: 'DELETE',
        success: (result) => {
          this.send('refresh');
        }
      });
    }
  }
});
