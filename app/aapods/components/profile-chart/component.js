import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default Ember.Component.extend({
  separators: new RegExp([';', '>=', '<=', '=='].join('|'), 'g'),
  restString: 'rest',
  classNames:['profile-chart--container'],
  possible_behavior: function () {
    if (!this.get('bpt') || (this.get('bpt') && !this.get('bpt').value)) {
      return [];
    }
    let sd = moment(this.get('endDate')).diff(this.get('startDate'), "days");

    const [dims_id, value_a,...rest] = this.get('bpt').value.split(this.get('separators'));
    if (rest.length > 0) {
      let options = [{
        display: "Same days last week",
        value: "last_week"
      }];
      if (Math.abs(sd) > 364) {
        options.push({
          display: "Same days last year",
          value: "last_year"
        });
      }
      return options.concat([
        {display: "Typical Overall", value: "typical_avg"}]);

    } else if (rest.length === 0 && moment(value_a, "YYYY-MM-DD", true).isValid()) {
      //if we have a single Date
      let options = [{
        display: "Same day last week",
        value: "last_week"
      }];
      if (Math.abs(sd) > 364) {
        options.push({
          display: "Same day last year",
          value: "last_year"
        });
      }
      return options.concat([
        {display: "Typical " + moment(value_a, "YYYY-MM-DD", true).format('dddd'), value: "typical_day"},
        {display: "Typical Overall", value: "typical_avg"}]);
    } else {
      //  if it is a column chart
      return [{display: this.get('restString'), value: "rest"}];
    }

  }.property('apt'),
  compare_mode: function () {
    return this.get('chart_state') && this.get('chart_state') !== 'start_compare';
  }.property('chart_state'),

  canCompare: function () {
    return this.get('dataset._id') && this.get('compareObject') && this.get('apt.value') && this.get('bpt.value');
  }.property('dataset', 'compareObject', 'apt', 'bpt'),

  actions: {
    start_compare: function () {
      this.set("chart_state", "start_compare");
    },
    send_comp: function (dataset_id, comp_obj, apt_value, btp_value, bfilter) {
      this.get('comp')(dataset_id, comp_obj, apt_value, btp_value, bfilter);
    },
    remove_point: function (pt) {
      if (pt === 'Bpt') {
        this.get('bpt').pts[0].unselect('bpt');
      } else {
        this.get('apt').pts[0].unselect('apt');
      }

      //     old code , need to be deleted after funnels and retention are migrated 20 oct 2016
      this.set('reset_point', pt);
      if (pt === 'Bpt') {
        //race condition
        setTimeout(()=> {
          this.set('reset_point', 'Apt');
        }, 100);
      }
    },
    behavior: function (type) {
      this.set('reset_point', "Apt");
      if (!this.get('startDate')) {
        this.set('startDate', this.get('chart_start_date'));
      }
      //this code is not good but I don't know how to access dimensionId from here:
      let value;
      const [dims_id, value_a,dims_id_2,value_b] = this.get('bpt').value.split(this.get('separators'));
      if (type.value === "typical_avg") {
        let start_date;
        if (moment(this.get('startDate')) <= moment(value_a).subtract(4, 'weeks')) {
          start_date = moment(value_a).subtract(4, 'weeks').format('YYYY-MM-DD');
        } else {
          start_date = moment(this.get('startDate')).format('YYYY-MM-DD');
        }

        value = dims_id + '>=' + start_date + ';' + dims_id + '<=' + value_a;
      } else if (type.value === "typical_day") {
        const dates = [];
        let current_date = moment(value_a);
        for (let i = 0; i < 4; i++) {
          current_date = current_date.subtract(1, 'weeks');
          if (current_date >= moment(this.get('startDate'))) {
            dates.push(current_date.format('YYYY-MM-DD'));
          }
        }
        value = dates.map((x)=> dims_id + '==' + x).join(',,');
      } else if (type.value === "last_week") {
        const start_date = moment(value_a).subtract(1, 'weeks').format('YYYY-MM-DD');
        if (value_b) {
          const end_date = moment(value_b).subtract(1, 'weeks').format('YYYY-MM-DD');
          value = dims_id + '>=' + start_date + ';' + dims_id + '<=' + end_date;
        } else {
          value = dims_id + '==' + start_date;
        }
      } else if (type.value === "last_year") {
        const start_date = moment(value_a).subtract(364, 'days').format('YYYY-MM-DD');
        if (value_b) {
          const end_date = moment(value_b).subtract(364, 'days').format('YYYY-MM-DD');
          value = dims_id + '>=' + start_date + ';' + dims_id + '<=' + end_date;
        } else {
          value = dims_id + '==' + start_date;
        }
      } else if (type.value === "rest") {
        value = 'rest';
      }

      //set timeout is because there is a race condition with the reset_point observer.
      setTimeout(()=> {
        this.get('setPoint')('a', {
          name: type.display,
          value: value
        });
      }, 10);

    }
  }

});
