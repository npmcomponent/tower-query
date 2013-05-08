
/**
 * Module dependencies.
 */

var validateConstraints = require('./validate-constraints');

/**
 * Expose `filter`.
 */

module.exports = filter;

/**
 * Filter records based on a set of constraints.
 *
 * This is a robust solution, hooking into an
 * extendable validation system. If you just need
 * something simple, use the built-in `array.filter`.
 *
 * @param {Array} array Array of plain objects (such as records)
 * @param {Array} constraints Array of constraints.
 */

function filter(array, constraints) {
  if (!constraints.length) return array;

  var result = [];

  // XXX: is there a more optimal algorithm?
  for (var i = 0, n = array.length; i < n; i++) {
    if (validateConstraints(array[i], constraints))
      result.push(array[i]);
  }

  return result;
}