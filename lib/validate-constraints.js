
/**
 * Module dependencies.
 */

var validator = require('tower-validator');

/**
 * Expose `validate`.
 */

module.exports = validate;

/**
 * Validate an object against an array of constraints.
 *
 * To define validations, use the `tower-validator` module.
 * XXX: that isn't implemented yet, they're in here.
 *
 * @param {Object} obj Record or other simple JavaScript object.
 * @param {Array} constraints Array of constraints.
 * @return {Boolean} true if obj passes all constraints, otherwise false.
 */

function validate(obj, constraints) {
  for (var i = 0, n = constraints.length; i < n; i++) {
    // XXX: obj vs. obj.get
    var constraint = constraints[i]
      , left = obj.get ? obj.get(constraint.left.attr) : obj[constraint.left.attr]
      , right = constraint.right.value;

    if (!validator(constraint.operator)(left, right))
      return false;
  }

  return true;
}