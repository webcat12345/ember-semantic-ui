/* jshint node: true */

module.exports = function (environment) {
  var ENV = {
    modulePrefix: 'datasenseui',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    podModulePrefix: 'datasenseui/aapods',
    featureFlags: {},
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },
    contentSecurityPolicyHeader: "Content-Security-Policy-Report-Only",
    contentSecurityPolicy: {
      'default-src': "'self' cdn.datatables.net",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' d1ks1friyst4m3.cloudfront.net www.google-analytics.com cdn.datatables.net api.usersnap.com",
      'font-src': "'self' cdn.datatables.net fonts.gstatic.com fonts.googleapis.com data:",
      'connect-src': "'self' api.mixpanel.com prod01be.cuberonlabs.com *.cuberonlabs.com *.cuberonlabs.com:7000 *.cuberonlabs.com:* app.trackduck.com localhost:7000",
      'img-src': "'self' cdn.datatables.net www.highcharts.com data:",
      'style-src': "'self' 'unsafe-inline' cdn.datatables.net fonts.googleapis.com",
      'frame-src': "'self'"
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };
  ENV.api_endpoint = process.env.API_ENDPOINT;
  ENV.featureFlags['spark_only'] = true;

  if (!ENV.api_endpoint) {
    ENV.api_endpoint = "https://prod01be.cuberonlabs.com";
  }
  if (environment === 'development') {
    //ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

  }

  if (environment === 'staging' || environment === 'production') {
    ENV.googleAnalytics = {
      webPropertyId: 'UA-69428115-1'
    };
    ENV.mixpanel = {
      LOG_EVENT_TRACKING: false,
      token: '0552d70ab319edc9e044cb67c80f355f'
    };
  }


  ENV.APP.API_HOST = ENV.api_endpoint;
  ENV.APP.API_HOST = ENV.api_endpoint;
  ENV.APP.API_NAMESPACE = null;
  ENV['simple-auth-oauth2'] = {
    serverTokenEndpoint: ENV.api_endpoint.concat('/o/token/'),
    refreshAccessTokens: true
  };
  ENV['simple-auth'] = {
    authorizer: 'simple-auth-authorizer:oauth2-bearer',
    routeAfterAuthentication: '/',
    crossOriginWhitelist: [ENV.api_endpoint]
  };
  ENV['ember-oauth2'] = {
    google: {
      clientId: "xxxxxxxxxxxx",
      authBaseUri: 'https://accounts.google.com/o/oauth2/auth',
      redirectUri: 'https://oauth2-login-demo.appspot.com/oauth/callback',
      scope: 'public write'
    }
  };

  return ENV;
};
