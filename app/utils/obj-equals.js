export default function objEquals(obj1, obj2, attr) {
  if (obj1 === obj2) {
    return true;
  } else if (obj1 == null || obj2 == null) {
    return false;
  } else if (typeof obj1.get === 'function' && typeof obj2.get === 'function') {
    return obj1.get(attr) === obj2.get(attr);
  } else if (obj1.hasOwnProperty(attr) && obj2.hasOwnProperty(attr)) {
    return obj1[attr] === obj2[attr];
  } else {
    return false;
  }
}

