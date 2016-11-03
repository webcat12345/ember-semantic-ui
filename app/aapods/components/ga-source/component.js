import Ember from 'ember';
import ENV from 'datasenseui/config/environment';


export default Ember.Component.extend({
  tagName: 'div',
  selectedAccount: null,
  selectedWebProperty: null,
  selectedProfile: null,

  disableWebProperty: Ember.computed.empty('selectedAccount'),
  disableProfile: Ember.computed.empty('selectedWebProperty'),
  disableAdd: Ember.computed.empty('selectedProfile'),

  accountSummaries: null,
  isOwner: function () {
    const username = this.get('user.username');
    const owner = this.get('model.userWithCredentials');
    return username === owner;
  }.property('user', 'model'),
  isSourceSetUp: function () {
    //todo might not be the best  verification
    return this.get('model.profileId');
  }.property('model'),
  setModel: function () {
    let sa = this.get('selectedAccount');
    let sw = this.get('selectedWebProperty');
    let sp = this.get('selectedProfile');

    if (sa) {
      this.set('model.accountId', sa.id);
    }
    if (sw) {
      this.set('model.webpropertyId', sw.id);
    }
    if (sp) {
      this.set('model.profileId', sp.id);
      this.set('model.profileName', sp.name);
    }
  }.observes('selectedAccount', 'selectedWebProperty', 'selectedProfile'),

  getModel: function () {
    let sa = this.get('model.accountId');
    let sw = this.get('model.webpropertyId');
    let sp = this.get('model.profileId');
    let accounts = this.get('accountSummaries');
    if (sa && accounts) {
      let selectedAccount = accounts.items.find(function (elem) {
        return elem.id === sa;
      });

      this.set('selectedAccount', selectedAccount);
      if (sw && selectedAccount) {
        let selectedWebProperty = selectedAccount.webProperties.find(function (elem) {
          return elem.id === sw;
        });

        this.set('selectedWebProperty', selectedWebProperty);

        if (sp && selectedWebProperty) {
          let selectedProfile = selectedWebProperty.profiles.find(function (elem) {
            return elem.id === sp;
          });

          this.set('selectedProfile', selectedProfile);
        }
      }
    }
  }.observes('model.accountId', 'model.webpropertyId', 'model.profileId', 'accountSummaries'),

  processFetchGA: function () {
    Ember.run.once(this, 'fetchGA');
  }.observes('model').on('init'),
  fetchGA: function () {
    this.set('loadingAuth', true);
    this.set('loadingSummaries', true);
    Ember.$.get(ENV.api_endpoint + '/setup/ga/authurl/', {state: this.get('model.datasetId')})
      .then((data)=> {
          this.set('loadingGA', false);
          this.set('authGA', data);
          this.set('error', false);
        }, (error) => {
          this.set('error', true);
          this.set('loading', false);
          console.log(error);
        }
      );

    let query = ENV.api_endpoint + '/setup/ga/management/accountSummaries/';
    if (this.get('model.userWithCredentials')) {
      query += '?user=' + this.get('model.userWithCredentials');
    }
    Ember.$.get(query)
      .then((data)=> {
          this.set('loadingAuth', false);
          this.set('accountSummaries', data);
          this.set('error', false);
        }, (error) => {
          this.set('error', true);
          this.set('loading', false);
          console.log(error);
        }
      );
  },

  authUrl: function () {
    return ENV.api_endpoint + "/setup/ga/authurl";
  }.property(),

  actions: {
    gadisconnect: function () {
      Ember.$.get(ENV.api_endpoint.concat('/setup/ga/disconnect/')).then(
        ()=> {
          this.set('authGA.needed', true);
        }, (error) => {
          console.log(error);
        }
      );
    },
    gaconnect: function () {
      const datasetId = this.get('model.datasetId');
      return Ember.$.get(ENV.api_endpoint.concat('/setup/ga/authurl/'), {state: datasetId}).then(function (value) {
        // on fulfillment
        console.log(value);
        window.location.replace(value.url);
      }, function (reason) {
        console.log(reason);
      });
    }
  }
});

