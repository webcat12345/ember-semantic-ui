import Ember from 'ember';


export default Ember.Component.extend({
  startDate: null,
  endDate: null,
  minDate: null,
  maxDate: null,
  classNames: ['ui', 'input'],
  getConfig: function () {
    const mind = this.get('minDate');
    const maxd = this.get('maxDate');
    let today = moment();
    if (maxd) {
      today = moment(maxd);
    }
    this.set('today', today);
    let ranges = {
      'All': [moment(mind), moment(maxd)],
      'Yesterday': [moment(today).subtract(1, 'days'), moment(today).subtract(1, 'days')],
      'Last 7 Days': [moment(today).subtract(6, 'days'), moment(today)],
      'Last 30 Days': [moment(today).subtract(29, 'days'), moment(today)],
      'This Month': [moment(today).startOf('month'), moment(today).endOf('month')],
      'Last Month': [moment(today).subtract(1, 'month').startOf('month'), moment(today).subtract(1, 'month').endOf('month')]
    };
    if (mind) {
      const minmom = moment(mind);
      const newranges = {};
      for (const key in ranges) {
        if (ranges.hasOwnProperty(key) && (ranges[key][0].isAfter(minmom) || ranges[key][0].isSame(minmom))) {
          newranges[key] = ranges[key];
        }
      }
      ranges = newranges;
    }

    const configs = {
      showDropdowns: true,
      timePicker: false,
      format: 'll',
      autoApply: false,
      autoUpdateInput: true,
      opens: "right",
      ranges: ranges
    };
    const sd = this.get('startDate');
    const ed = this.get('endDate');
    if (sd) {
      configs.startDate = moment(sd);
    }
    if (ed) {
      configs.endDate = moment(ed);
    }
    if (mind) {
      configs.minDate = moment(mind);
    }
    if (maxd) {
      configs.maxDate = moment(maxd);
    }

    if (this.get('config')) {
      Ember.merge(configs, this.get('config'));
    }
    return configs;
  },
  didInsertElement: function () {
    const config = this.getConfig();
    this.$('#datetimepicker1').daterangepicker(
      config,
      (start, end)=> {
        this.set('startDate', start.format('YYYY-MM-DD'));
        this.set('endDate', end.format('YYYY-MM-DD'));
      }
    );
    if (this.get('startDate')) {
      this.$('#datetimepicker1').data('daterangepicker').setStartDate(moment(this.get('startDate')));
    } else if (this.get('default')) {
      this.set('startDate', moment(this.get('today')).subtract(29, 'days').format('YYYY-MM-DD'));
    }
    if (this.get('endDate')) {
      this.$('#datetimepicker1').data('daterangepicker').setEndDate(moment(this.get('endDate')));
    } else if (this.get('default')) {
      this.set('endDate', moment(this.get('today')).format('YYYY-MM-DD'));
    }
  },
  setStartDate: function () {
    const s = this.get('startDate');
    if (s) {
      this.$('#datetimepicker1').data('daterangepicker').setStartDate(moment(s));
    }
  }.observes('startDate'),

  setEndDate: function () {
    const e = this.get('endDate');
    if (e) {
      this.$('#datetimepicker1').data('daterangepicker').setEndDate(moment(e));
    }
  }.observes('endDate')
});

