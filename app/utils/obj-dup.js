export function isDuplicate(obj1, obj2, recurseFor) {
  if (!obj1 || !obj2) {
    return obj1 === obj2;
  }
  for (const k1 in obj1) {
    if (obj1.hasOwnProperty(k1)) {
      const v1 = obj1[k1];
      const v2 = obj2[k1];
      if (!v1 || !v2 ||
        (typeof v1 !== "object" && typeof v1 !== "function")) {
        if (v1 !== v2) {
          return false;
        }
      } else if (recurseFor && recurseFor.indexOf && recurseFor.indexOf(k1) >= 0) {
        if (JSON.stringify(v1) !== JSON.stringify(v2)) {
          return false;
        }
      }
    }
  }
  for (const k2 in obj2) {
    if (obj2.hasOwnProperty(k2)) {
      if (!(k2 in obj1)) {
        return false;
      }
    }
  }

  return true;
}
