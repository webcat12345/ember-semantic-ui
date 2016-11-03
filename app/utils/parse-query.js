export default {
  parseQuery: function (query, schema) {
    var parsed = {
      remainingQuery: null,
      entityType: null,
      metric_id: null,
      date: null,
      selectedFacets: [],
      selectedX_id: null,
      topN: null,

      _sFactors: new Set()
    };

    if (!query) {
      return parsed;
    }

    parsed.remainingQuery = query.toLowerCase();

    parsed = this.parseMetricAndET(schema, parsed);
    parsed = this.parseDate(schema, parsed);
    parsed = this.parseSelectedFacets(schema, parsed);
    parsed = this.parseTopN(schema, parsed);
    parsed = this.parseXable(schema, parsed);

    return parsed;
  },
  parseInsightQuery: function (query, schema) {
    var parsed = {
      remainingQuery: null,
      sort: null,
      selectedPatterns: [],
      selectedFactors: [],
      entityType: null,
      metric_id: null,
      date: null,
      selectedFacets: [],
      _sFactors: new Set()
    };

    if (!query) {
      return parsed;
    }

    parsed.remainingQuery = query.toLowerCase();

    parsed = this.parseMetricAndET(schema, parsed);
    parsed = this.parseDate(schema, parsed);
    parsed = this.parseSelectedFacets(schema, parsed);
    parsed = this.parsePatternSort(schema, parsed);
    parsed = this.parsePatternTypes(schema, parsed);
    parsed = this.parseSelectedFactors(schema, parsed);

    return parsed;
  },

  parseXable: function (schema, parsed) {
    var xable = schema.get('xableFactors');
    if (xable) {
      var foundn = null;
      for (var xi = 0; xi < xable.length; xi++) {
        var factor = xable[xi];
        var fn = factor.get('name').toLowerCase();
        if (factor.get('type') !== 'date' &&
          parsed.entityType && factor.get('entity_type') !== parsed.entityType.id) {
          continue;
        }
        if (parsed.remainingQuery.indexOf('by ' + fn) > -1 && (!foundn || foundn.length < fn.length)) {
          parsed.selectedX_id = factor.get('id');
          foundn = fn;
        }
        if (parsed.topN && parsed.remainingQuery.indexOf('top ' + parsed.topN + ' ' + fn) > -1 &&
          (!foundn || foundn.length < fn.length)) {
          parsed.selectedX_id = factor.get('id');
          foundn = fn;
        }
      }
      if (foundn) {
        parsed.remainingQuery = parsed.remainingQuery.replace(foundn, '');
      }
    }
    return parsed;
  },
  parseTopN: function (schema, parsed) {
    var topRegex = /top (\d+)/g;
    var arr = topRegex.exec(parsed.remainingQuery);
    if (arr) {
      parsed.topN = Number(arr[1]);
    }
    return parsed;
  },
  parseSelectedFactors: function (schema, parsed) {
    var factors = schema.get('factors');
    var finalf = [];
    for (var ci = 0; ci < factors.length; ci++) {
      var factor = factors[ci];
      if (parsed.metric_id === factor.id) {
        continue;
      }
      if (factor.get('type') === 'metric' || factor.get('type') === 'basic') {
        continue;
      }
      var fn = factor.name.toLowerCase();
      if (parsed.remainingQuery.indexOf(fn) > -1 && !parsed._sfactors.has(factor.id)) {
        finalf.push({id: factor.get('id'), parsename: fn});
      }
    }
    finalf.sort(function (a, b) {
      return b.parsename.length - a.parsename.length;
    });
    for (var fi = 0; fi < finalf.length; fi++) {
      var ff = finalf[fi];
      if (parsed.remainingQuery.indexOf(ff.parsename) >= 0) {
        parsed.selectedFactors.push(ff.id);
        parsed.remainingQuery = parsed.remainingQuery.replace(ff.parsename, '');
      }
    }
    return parsed;
  },
  parsePatternTypes: function (schema, parsed) {
    var patternTypes = schema.get('patternTypes');
    for (var pti = 0; pti < patternTypes.length; pti++) {
      var ptn = patternTypes[pti].type.toLowerCase();
      if (parsed.remainingQuery.indexOf(ptn) > -1) {
        parsed.selectedPatterns.push(patternTypes[pti].type);
        parsed.remainingQuery = parsed.remainingQuery.replace(ptn, '');
      }
    }
    return parsed;
  },
  parsePatternSort: function (schema, parsed) {
    var sortArr = schema.get('sortArray');
    var sfn = null;
    for (var si = 0; si < sortArr.length; si++) {
      var s = sortArr[si].name.toLowerCase().replace('sort by ', '').replace('score:', '').trim();
      if (parsed.remainingQuery.indexOf(s) > -1) {
        if (!sfn || sfn.length < s.length) {
          parsed.sort = sortArr[si];
          sfn = s;
        }
      }
    }
    parsed.remainingQuery = parsed.remainingQuery.replace(sfn, '');
    return parsed;
  },
  parseDate: function (schema, parsed) {
    var dates = schema.get('dates');
    for (var di = 0; di < dates.length; di++) {
      if (parsed.remainingQuery.indexOf(dates[di].name.toLowerCase()) > -1) {
        parsed.date = dates[di];
        break;
      }
    }
    if (parsed.date) {
      parsed.remainingQuery = parsed.remainingQuery.replace(parsed.date.name.toLowerCase(), '');
    }
    return parsed;
  },
  parseMetricAndET: function (schema, parsed) {
    var metrics = schema.get('metrics');
    var entityTypes = schema.get('entityTypes');
    for (var i = 0; i < entityTypes.length; i++) {
      var n = entityTypes[i].name;
      n = n.substring(0, n.length - 1).toLowerCase();
      if (parsed.remainingQuery.indexOf(n) > -1) {
        if (!parsed.entityType || parsed.entityType.name.length < n.length) {
          parsed.entityType = entityTypes[i];
        }
      }
    }

    var mfn = null;
    var mf = null;
    for (i = 0; i < metrics.length; i++) {
      var f = metrics[i];
      var fn = f.name.toLowerCase().replace('rate', '').trim();
      if (parsed.entityType === null || parsed.entityType.id === f.entity_type) {
        if (parsed.remainingQuery.indexOf(fn) > -1) {
          if (!parsed.metric_id || mfn.length < f.name.length) {
            parsed.metric_id = f.get('id');
            mfn = f.name;
            mf = f;
          }
        }
      }
    }
    if (parsed.entityType == null && mf != null) {
      entityTypes.forEach(function (et) {
        if (et.id === mf.entity_type) {
          parsed.entityType = et;
        }
      });
    }

    if (mfn) {
      parsed.remainingQuery = parsed.remainingQuery.replace(mfn, '');
    }
    if (parsed.entityType) {
      parsed.remainingQuery = parsed.remainingQuery.replace(parsed.entityType.name.toLowerCase());
    }
    return parsed;
  },
  parseSelectedFacets: function (schema, parsed) {
    parsed._sfactors = new Set();
    var facets = schema.get('facets');
    if (facets) {
      var finalsel = [];
      for (var fgi = 0; fgi < facets.length; fgi++) {
        var facet = facets[fgi];
        if (parsed.entityType && facet.factor.entity_type !== parsed.entityType.id &&
          facet.factor.type !== 'date') {
          continue;
        }
        if (parsed.metric && facet.factor.id === parsed.metric.id) {
          continue;
        }
        var name = "default";
        try {
          name = facet.group.toLowerCase().trim() + ' ' + facet.name.toString().toLowerCase().trim();
        }
        catch (err) {
          name = "error";
        }
        if (parsed.remainingQuery.indexOf(name) > -1) {
          finalsel.push({id: facet.get('id'), parsename: name, gid: facet.get('factor').get('id')});
        }
      }
      finalsel.sort(function (a, b) {
        return b.parsename.length - a.parsename.length;
      });
      for (var fsi = 0; fsi < finalsel.length; fsi++) {
        var sf = finalsel[fsi];
        if (parsed.remainingQuery.indexOf(sf.parsename) >= 0) {
          parsed._sfactors.add(sf.gid);
          parsed.selectedFacets.push(sf.id);
          parsed.remainingQuery = parsed.remainingQuery.replace(sf.parsename, '');
        }
      }
    }
    return parsed;
  }
};
