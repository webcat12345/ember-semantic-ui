import Ember from 'ember';
import config from '../config/environment';

export default {
  name: 'new-relic',

  initialize() {
    if (!doReporting()) {
      return;
    }

    Ember.onerror = handleError;

    Ember.RSVP.on('error', handleError);

    Ember.Logger.error = function (message, cause, stack) {
      handleError(generateError(cause, stack));
    };
  }
};

function doReporting() {
  return typeof NREUM !== 'undefined' && config.enableNewRelicErrorReporting;
}

function handleError(error) {
  try {
    NREUM.noticeError(error);
  } catch (e) {
    // ignore
  }
  console.error(error.stack);
}

function generateError(cause, stack) {
  var error = new Error(cause);
  error.stack = stack;
  return error;
}

