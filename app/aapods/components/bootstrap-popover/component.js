import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  message: null,
  title: null,
  text: null,
  textClass: "popover-title",
  didInsertElement: function () {
    var _this = this;
    // this.$("[data-toggle=popover]").popover({
    //   html : true,
    //   container: "body",
    //   content: function() {
    //     return _this.$('#content').html();
    //   }
    // });
  }
});

