import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default function ajaxJson(url, data, type) {
  var ajax = ENV.api_endpoint + url;
  if (type === "GET") {
    return Ember.$.ajax({
      url: ajax,
      type: type,
      contentType: "application/json"
    }).fail(function (error) {
      console.log('error:' + error);
      return [];
    });
  } else if (type = "POST") {
    return Ember.$.ajax({
      url: ajax,
      type: type,
      data: JSON.stringify(data),
      contentType: "application/json"
    }).fail(function (error) {
      console.log('error:' + error);
      return [];
    });
  }

}
