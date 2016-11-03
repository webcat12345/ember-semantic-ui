import OAuthCustomAuthenticator from '../utils/oauth-custom';

export default {
    name: 'oauth-custom',
    before: 'simple-auth',

    initialize: function(container) {
        container.register(
            'oauth-custom:oauth2-password-grant', OAuthCustomAuthenticator);
    }
};
