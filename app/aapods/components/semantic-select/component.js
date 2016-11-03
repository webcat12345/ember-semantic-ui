import Ember from 'ember';


export default Ember.Component.extend({
  show: true,
  disabled: false,
  required: true,
  multiple: false,
  button: false,
  compact: false,
  size: null,
  style: null,
  text_color: null,
  fluid: true,
  tagName: "span",
  uiType: "select",
  _selection: null,
  _value: null,
  loading: false,
  _disabled: function () {
    //removed  || !this.get('content')
    //todo should verify
    return this.get('disabled');
  }.property('disabled', 'content'),

  dropdownType: function () {
    let c = "ui ";
    if (this.get('compact')) {
      c += "compact ";
    }
    if (this.get('uiType') === "inline") {
      c += "search inline dropdown";
    } else if (this.get('fluid')) {
      c += "fluid search selection dropdown wide-as-parent";
    } else {
      c += "ui search selection dropdown";
    }
    if (this.get('button')) {
      c += ' button';
    }
    if (this.get('size')) {
      c += ' ' + this.get('size');
    }
    if (this.get('dropdown_class')) {
      c += ' ' + this.get('dropdown_class');
    }
    if (this.get('style')) {
      c += ' ' + this.get('style');
    }
    return c;
  }.property('uiType', 'fluid', 'button', 'size', 'style'),

  multipleDropdownType: function () {
    return this.get('dropdownType') + ' multiple';
  }.property('multiple'),

  disabledDropdownType: function () {
    return this.get('dropdownType') + " disabled ";
  }.property('dropdownType', 'disabled'),

  loadingDropdownType: function () {
    return this.get('dropdownType');
  }.property('dropdownType', 'loading'),

  getProperty: function (item, property) {
    if (item instanceof Ember.Object) {
      return item.get(property);
    } else {
      return item[property];
    }
  },

  selectedName: function () {
    let s = this.get('_selection');
    let vp = this.get('optionLabelPath');
    if (!s) {
      return null;
    }
    if (!vp || vp.indexOf('content.') !== 0) {
      return null;
    }
    return this.getProperty(s, vp.substring(8));
  }.property('_selection', 'optionLabelPath'),

  parsedContent: function () {
    let c = this.get('content');
    let lp = this.get('optionLabelPath');
    let vp = this.get('optionValuePath');
    let vps = null;
    if (vp && vp.indexOf('content.') === 0) {
      vps = vp.substring(8);
    }
    let lps = null;
    if (lp && lp.indexOf('content.') === 0) {
      lps = lp.substring(8);
    }
    let arr = Ember.A([]);
    if (!c) {
      return arr;
    }
    let self = this;
    c.forEach(function (item) {
      let name = item;
      let value = item;
      if (vps) {
        value = self.getProperty(item, vps);
      }
      if (lps) {
        name = self.getProperty(item, lps);
      }
      arr.pushObject(Ember.Object.create({
        name: name,
        value: value
      }));
    });
    return arr;
  }.property('content', 'optionLabelPath', 'optionValuePath', 'multiple'),

  setFromContent: function (value, selection) {
    let content = this.get('content');
    let vp = this.get('optionValuePath');
    if (!content) {
      return;
    }
    let val = value;
    let sel = selection;

    if (value && content && vp && !this.get('multiple')) {
      sel = content.findBy(vp.substring(8), value);
    } else if (selection && vp) {
      val = this.getProperty(selection, vp.substring(8));
    }
    if (val === undefined) {
      val = null;
    }
    if (sel === undefined) {
      sel = null;
    }

    if (val !== this.get('_value') || sel !== this.get('_selection')) {
      this.set('_value', val);
      // update UI if already rendered
      const dropdown = this.$('.dropdown');
      if (dropdown) {
        dropdown.dropdown('set selected', val);
      }
      if (!this.get('multiple')) {
        this.set('_selection', sel);
      }
    }
  },

  doCallback: function () {
    const sel = this.get('_selection');
    const val = this.get('_value');

    let callback = this.get('onSelect');
    if (!callback && val !== this.get('value')) {
      this.set('value', val);

    }
    if (!callback && sel !== this.get('selection')) {
      this.set('selection', sel);
    }
    if (callback && (val !== this.get('value') || sel !== this.get('selection'))) {
      callback(sel, val);
    }
  },

  didReceiveAttrs: function () {
    this.setFromContent(this.get('value'), this.get('selection'));
  },

  updateSelection: function () {
    // an observer to enable controllers to update selection
    const selection = this.get('selection');
    const _selection = this.get('_selection');
    if (selection && selection !== _selection) {
      this.setFromContent(null, selection);
      this.set('show', false);
    }
  }.observes('selection'),

  reRender: function() {
    // a kludge to ensure controller can update selection
    setTimeout(() => {this.set('show', true);}, 10);
  }.observes('show'),

  setupValues: function () {
    // let values = this.get('_value');
    // if (this.get('multiple') && !this.get('loading') && !this.get('_disabled') && values) {
    // this.$('.ui.dropdown').dropdown('set exactly', values.split(","));
    // }
  }.observes('multiple', 'value', 'loading', '_disabled'),

  actions: {

    setValue: function (component, allValue) {
      this.set('allValue', allValue);
    },

    onHide: function () {
      setTimeout(() => {document.activeElement.blur();}, 10);
      if (this.get('allValue') === 'NEWNEW') {
        let ac = this.get('newEvent');
        if (ac) {
          this.set('_value', null);
          this.set('_selection', null);
          ac();
        }
      } else {
        this.setFromContent(this.get('allValue'), null);
        Ember.run.once(this, 'doCallback');
      }
    }

  }
})
;
