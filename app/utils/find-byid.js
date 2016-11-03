export default function findByid(array, id) {
  if (id && array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].id === id) {
        return array[i];
      }
    }
  }
  return null;
}
