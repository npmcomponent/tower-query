
/**
 * Expose `Constraint`.
 */

module.exports = Constraint;

/**
 * Class representing a query constraint.
 *
 * @class
 *
 * @param {String} a The left constraint.
 * @param {String} operator The constraint.
 * @param {String} b The right constraint.
 * @param {Object} start The starting object.
 * @api public
 */

function Constraint(a, operator, b, start) {
  this.left = left(a, start);
  this.operator = operator;
  this.right = right(b);
}

function left(val, start) {
  var variable = {};

  val = val.split('.');

  switch (val.length) {
    case 3:
      variable.adapter = val[0];
      variable.resource = val[1];
      variable.attr = val[2];
      variable.ns = variable.adapter + '.' + variable.resource;
      break;
    case 2:
      variable.adapter = 'memory'; // XXX: adapter.default();
      variable.resource = val[0];
      variable.attr = val[1];
      variable.ns = variable.resource;
      break;
    case 1:
      variable.adapter = 'memory'; // XXX: adapter.default();
      variable.resource = start;
      variable.attr = val[0];
      variable.ns = variable.resource;
      break;
  }
  
  variable.path = variable.ns + '.' + variable.attr;

  return variable;
}

function right(val) {
  // XXX: eventually handle relations/joins.
  return { value: val, type: typeof(val) };
}