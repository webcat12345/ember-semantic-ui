import Ember from 'ember';
export default Ember.Component.extend({
  type: null,
  factors: null,
  selectedFactorIds: null,
  columnArr: function () {
    var cs = this.get('factors');
    var csarr = Ember.A([]);
    if (cs) {
      cs.forEach(function (col) {
        csarr.pushObject(col);
      });
    }
    return csarr;
  }.property('factors'),
  selectedFactors: null,
  setSelected: function () {
    var sc = this.get('selectedFactors');
    var ms = this.get('selectedFactorIds');
    var carr = this.get('columnArr');
    if (!carr || carr.length <= 0) {
      return;
    }
    if (!sc && !ms) {
      return;
    }
    if ((!sc || sc.length <= 0) && ms) {
      var s = Ember.A([]);
      for (var i = 0; i < ms.length; i++) {
        for (var j = 0; j < carr.length; j++) {
          if (ms[i] === carr[j].get('id')) {
            s.pushObject(carr[j]);
            break;
          }
        }
      }
      if (s.length > 0) {
        this.set('selectedFactors', s);
      }
    }
    if (sc) {
      var existingm = new Set(ms);
      var newms = Ember.A([]);
      var foundnew = false;
      for (var si = 0; si < sc.length; si++) {
        var id = sc[si].get('id');
        if (!existingm.has(id)) {
          foundnew = true;
        }
        newms.pushObject(id);
      }
      if (foundnew) {
        this.set('selectedFactorIds', newms);
      }
    }
  }.observes('columnArr', 'selectedFactors.@each').on('init')
});

