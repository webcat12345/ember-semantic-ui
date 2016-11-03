import Ember from 'ember';

export function formatBucket(bucket/*, hash*/) {

  //trying to see if it is a "usual Week Day"
  if (bucket[0].bucket.length > 1 && moment(bucket[0].bucket[0].value, "YYYY-MM-DD", true).isValid() && bucket[0].bucket[0].op === '=') {
    const day = moment(bucket[0].bucket[0].value).format('dddd');
    const op = bucket[0].bucket[0].op;
    let isSame = true;
    bucket[0].bucket.forEach((x)=> {
      if (x.op !== op || moment(x.value).format('dddd') !== day) {
        isSame = false;
      }
    });
    if (isSame) {
      return "Typical " + day
    }

  }
  let res = "";
  const params = bucket[0];
  if (params.bucket[0] && params.bucket[0].value) {
    if (params.bucket[1]) {
      params.bucket.forEach(function (val) {
        res += val.name + val.op + val.value + " ";
      })
    } else if (params.bucket[0]) {
      res = params.bucket[0].name + "=" + params.bucket[0].value;
    } else {
      return params.bucket;
    }
  } else if (typeof params.bucket === 'string') {
    res = params.bucket
  }
  return res;
}

export default Ember.Helper.helper(formatBucket);
