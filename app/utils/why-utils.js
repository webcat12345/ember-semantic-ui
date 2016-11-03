import Ember from 'ember';
import ENV from 'datasenseui/config/environment';

export function _groups(dims, all) {
  let funHash = {};
  dims.forEach(function (val) {
    if (val.get("group")) {
      let groups = val.get("group").split(",");
      groups.forEach(function (grp) {
        if (all || grp !== 'prerun') {
          if (!(grp in funHash)) {
            funHash[grp] = {metrics: Ember.A([]), name: grp};
          }
          funHash[grp].metrics.addObject({id: val.get("id"), text: val.get("name"), obj: val});
        }
      });
    }
  });
  let funnels = Ember.A([]);
  for (var val in funHash) {
    funnels.addObject(funHash[val]);
  }

  return funnels.sortBy('text');
}

export function _sameDOnly(compare_type) {
  return compare_type !== "optimize";

}

export function _sigOnly(compare_type) {
  return compare_type !== "optimize";

}

export function _metrics(otherdiff) {
  let pieinfo = {};
  let results = otherdiff;
  let data = [];
  results.forEach(function (val) {
    let tuple = {};
    tuple["name"] = val.metricname;
    tuple["y"] = val.diff.pm;
    tuple["object"] = val;
    data.push(tuple);
  });
  pieinfo["data"] = data;
  return pieinfo;
}

export function _dims(filtered_points, dimHash, count = 5) {
  let dims = {};
  let sorted_dims = [];
  for (let idx = 0; idx < filtered_points.length; idx++) {
    let oneSegment = filtered_points[idx];
    if (!oneSegment) {
      continue;
    }
    if (count) {

      if (oneSegment.facet.fname in dims) {
        if (dims[oneSegment.facet.fname]['values'].length < 2) {
          dims[oneSegment.facet.fname]['values'].push(oneSegment);
        }
        count -= 1;
      } else {
        let tuple = {};
        if (!(oneSegment.facet.f in dimHash)) {
          console.log("Error: dimension  in response missing");
          continue;
        }
        tuple["name"] = dimHash[oneSegment.facet.f].get("name");// + ":" + oneSegment.facet.n;
        tuple["y"] = Math.abs(oneSegment.facet.combo);
        tuple["object"] = {'factor': {'id': oneSegment.facet.f, 'name': oneSegment.facet.fname}};
        tuple["values"] = [oneSegment];
        dims[oneSegment.facet.fname] = tuple;
        sorted_dims.push(tuple);
        count -= 1;
      }
    } else {
      break;
    }
  }
  return sorted_dims;
}

export function _dimpts(facets, show) {
  //let signficantOnly = this.get('significantOnly');
  //let sameDirectionOnly = this.get('sameDirectionOnly');
  if (!facets) {
    return [];
  }
  if (!show || show === 'combo') {
    show = 'contribdiff';
  }
  let pts = Ember.A([]);
  for (let i = 0; i < facets.length; i++) {

    pts.push(Ember.Object.create({
      y: Number(facets[i][show].toFixed(2)),
      name: name,
      facet: facets[i],
      score: Math.abs(facets[i][show]),
      isWinner: isWinner
    }));
  }
  return pts;
}
export function _filter2(pts, isWinner) {
  let fpts = [];
  if (isWinner === null) {
    return pts;
  } else {
    pts.forEach(function (val) {
      if (val.isWinner === isWinner) {
        fpts.push(val);
      }
    });
    return fpts;
  }
}

export function _filter(vals, dim, config) {
  let fVals = [];
  vals.forEach(function (val) {
    if (!dim && config.significantOnly && !val.facet.isSignificant) {
      return;
    }
    if (!dim && config.sameDirectionOnly && !val.facet.isContributor) {
      return;
    }
    fVals.push(val);
  });
  return fVals;
}

