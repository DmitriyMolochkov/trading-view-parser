function generateRandomString(length = 20) {
  let str = '';
  while (str.length < length) str += Math.random().toString(36).slice(2);
  return str.slice(0, length);
}

module.exports = {
  generateRandomString
}