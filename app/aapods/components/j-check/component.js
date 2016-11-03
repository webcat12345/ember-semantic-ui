import Ember from 'ember';

export default Ember.Checkbox.extend({
  change(){
    this._super(...arguments);
    this.get("controller").send(this.get('action'), this.get('entity'), this.get('checked'), this.get('entityval'));
  }
});