import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'div',
  actions: {
    toggleFacet: function (facet) {
      facet.toggle();
      this.sendAction('facetToggled', facet);
    },
    toggleRemove: function (facet) {
      facet.toggleRemove();
      this.sendAction('removeToggled', facet);
    },
    showMore: function(facetGroup) {
      facetGroup.set('showMore', !facetGroup.get('showMore'));
    }
  }
});

