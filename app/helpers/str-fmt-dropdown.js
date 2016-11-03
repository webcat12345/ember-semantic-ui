import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function (str) {
  const strSplited = str.split(' ');

  const splited = strSplited.map((x)=> {
    return chunk_split(x, 25, ' ');
  });
  return splited.join(' ').replace(/\s\s+/g, ' ');
});


function chunk_split(body, chunklen, end) {
  // Returns split line
  // *     example 1: chunk_split('Hello world!', 1, '*');
  // *     returns 1: 'H*e*l*l*o* *w*o*r*l*d*!*'
  // *     example 2: chunk_split('Hello world!', 10, '*');
  // *     returns 2: 'Hello worl*d!*'
  chunklen = parseInt(chunklen, 10) || 76;
  end = end || '\r\n';

  if (chunklen < 1) {
    return false;
  }

  return body.match(new RegExp(".{0," + chunklen + "}", "g")).join(end);
}
