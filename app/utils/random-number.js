export default function random_number(min, max, decimals) {
  return +((max - min) * Math.random() + min).toFixed(decimals);
}
