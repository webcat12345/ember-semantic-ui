import Ember from 'ember';
import ENV from 'datasenseui/config/environment';


export default Ember.Component.extend({
  enableSearch: function () {
    this.$('.searchSchema').on('click', ()=> {
      //todo this is not a good solution to hide the palceholder
      this.$('.searchSchema>.text').html(
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
        '&nbsp;&nbsp;');
    }).focusout(()=> {
      this.$('.searchSchema>.text').html("Search in your data");
    });
    this.$('.searchSchema')
      .dropdown({
        forceSelection: false,
        minCharacters: 1,
        onHide: ()=> {
          //using the onHide callback to allow use of arrows
          const value = this.get('value');
          if (!value) {
            return true;
          }
          const name = this.get('name');
          const filters = this.get('filters');
          const filtersIds = filters.map((x)=>x.filter_id);
          let id = 0;
          if (filtersIds.length !== 0) {
            id = Math.max(...filtersIds) + 1;
          }
          const [dimsId,dimsName,dimsValue] = value.split('&&&');
          //function get called twice so we need that check:
          if (dimsId) {
            //check if the first filter is empty, if yes replace it
            if (filters.length === 1 && !filters[0].dimsId) {
              filters.removeAt(0);
            }
            filters.addObject({
              dimsId: dimsId,
              dimsName: dimsName,
              filterType: '==',
              values: [dimsValue],
              filter_id: id
            });

            setTimeout(()=> {
              $('.searchSchema').dropdown('clear');
              document.activeElement.blur();
            }, 10);
          }
          return true;
        },
        onChange: (value, name)=> {
          //using the onHide callback to allow use of arrows
          this.set('value', value);
          this.set('name', name);
          return false;
        },
        saveRemoteData: false,
        apiSettings: {
          saveRemoteData: false,
          url: `${ENV.api_endpoint}/schema/search/${this.get('dataset_id')}/?query={query}`,
          onResponse: function (results) {
            const choices = [];
            for (const key in results) {
              if (!isNaN(key)) {
                const value = results[key];
                value[1] = Ember.Handlebars.Utils.escapeExpression(value[1]);
                value[2] = Ember.Handlebars.Utils.escapeExpression(value[2]);
                const dim_display = fmtString(value[1]);
                const value_display = fmtString(value[2]);
                const name = value_display ? "<b>" + dim_display + "</b> : <i>" + value_display + "</i>" : "<b>" + dim_display + "</b>";
                choices.push({
                  name: name,
                  value: value.join('&&&')
                });
              }
            }
            return {
              "success": true,
              "results": choices
            };
          }
        }
      });
  }.on('didRender')
});


function fmtString(str) {
  const strSplited = str.split(' ');

  const splited = strSplited.map((x)=> {
    return chunk_split(x, 20, '<br>');
  });
  return splited.join(' ');
}


function chunk_split(body, chunklen, end) {
  // Returns split line
  // *     example 1: chunk_split('Hello world!', 1, '*');
  // *     returns 1: 'H*e*l*l*o* *w*o*r*l*d*!*'
  // *     example 2: chunk_split('Hello world!', 10, '*');
  // *     returns 2: 'Hello worl*d!*'
  chunklen = parseInt(chunklen, 10) || 76;
  end = end || '\r\n';

  if (chunklen < 1) {
    return false;
  }
  return body.match(new RegExp(".{0," + chunklen + "}", "g")).join(end);
}
