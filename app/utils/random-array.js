function random_number(min, max) {
  return +((max - min) * Math.random() + min).toFixed(2);
}

export default function randomArray(num_elements, min, max) {
  var nums = [];

  for (var element=0; element<num_elements; element++) {
    nums[element] = random_number(min, max);
  }

  return (nums);
}
