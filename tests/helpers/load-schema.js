import Ember from 'ember';
import Schema from 'datasenseui/utils/schema';

Ember.Test.registerAsyncHelper('loadSchema', function(app, dataset_id) {
  return new Ember.Test.promise(function(resolve) {

    // inform the test framework that there is an async operation in progress,
    // so it shouldn't consider the test complete
    Ember.Test.adapter.asyncStart();

    // get a handle to the promise we want to wait on
    var promise = Schema.create({}).fetch({id: dataset_id, name: "Test", type: 'csv'});

    promise.then(function(){

      // wait until the afterRender queue to resolve this promise,
      // to give any side effects of the promise resolving a chance to
      // occur and settle
      Ember.run.schedule('afterRender', null, resolve);

      // inform the test framework that this async operation is complete
      Ember.Test.adapter.asyncEnd();
    });
  });
});
