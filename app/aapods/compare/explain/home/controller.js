import Ember from 'ember';

export default Ember.Controller.extend({
  answer: Ember.computed.readOnly('model.results.answer'),
  compare: Ember.computed.readOnly('model')
});

