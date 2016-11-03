import Ember from "ember";
var get = Ember.get;

export default function(options) {
  var data = options.data,
    fn   = options.fn,
    view = data.view,
    childView;

  childView = view.createChildView(Ember._MetamorphView, {
    context: get(view, 'context'),

    template: function(context, options) {
      options.data.insideGroup = true;
      return fn(context, options);
    }
  });

  view.appendChild(childView);
}
