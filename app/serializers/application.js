import DRFSerializer from './drf';

export default DRFSerializer.extend({
  serialize: function(record, options) {
    options = options ? options : {}; // handle the case where options is undefined
    options.includeId = true;
    return this._super.apply(this, [record, options]); // Call the parent serializer
  }
});
