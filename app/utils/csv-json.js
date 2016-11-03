import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export default function csvJson(datasetid, resource, type, id, select) {
  var ui = "/data/";
  var ajax = ENV.api_endpoint + '/data/';

  if (datasetid) {
    ui += datasetid + "/";
    ajax += "dataset/" + datasetid + "/";
  }

  if (type === "json") {
    return Ember.$.getJSON(ui + resource + ".json", {id:id});
  } else if (type === "csv") {
    return Ember.$.get(ui + resource + ".csv").then(
      function (data) {
        var origobjs = $.csv.toObjects(data);
        var objs = [];
        for (var o = 0; o < origobjs.length; o++) {
          var obj = {};
          var oo = origobjs[o];
          for (var property in oo) {
            if (oo.hasOwnProperty(property) &&
              typeof oo[property] !== "function" &&
              typeof oo[property] !== "object") {
              obj[property] = oo[property];
            }
          }
          objs.push(obj);
        }
        if (id && objs) {
          for (var i = 0; i < objs.length; i++) {
            if (objs[i].id === id) {
              return objs[i];
            }
          }
        } else if (select && objs) {
          var selectedObjs = [];
          for (var j = 0; j < objs.length; j++) {
            var match = false;
            for (var s in select) {
              if (objs[j][s] !== select[s]) {
                break;
              }
              match = true;
            }
            if (match) {
              selectedObjs.push(objs[j]);
            }
          }
          return selectedObjs;
        } else {
          return objs;
        }
      },
      function (error) {
        console.log(ui + ":" + resource + ":" + type);
        console.log(error);
      }
    );
  } else if (type === "ajax") {
    return Ember.$.get(ajax + resource).then(function(data) {
      return data;
    }, function(error) {
        console.log('error:' + error);
        return null;
    });
  } else {
    console.log("Error: Invalid type: " + type);
  }
}
