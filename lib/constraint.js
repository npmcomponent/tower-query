
/**
 * Expose `Constraint`.
 */

module.exports = Constraint;

/**
 * Instantiate a new `Constraint`.
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
      variable.model = val[1];
      variable.attr = val[2];
      variable.ns = variable.adapter + '.' + variable.model;
      break;
    case 2:
      variable.adapter = 'memory'; // XXX: adapter.default();
      variable.model = val[0];
      variable.attr = val[1];
      variable.ns = variable.model;
      break;
    case 1:
      variable.adapter = 'memory'; // XXX: adapter.default();
      variable.model = start;
      variable.attr = val[0];
      variable.ns = variable.model;
      break;
  }
  
  variable.path = variable.ns + '.' + variable.attr;

  return variable;
}

function right(val) {
  // XXX: eventually handle relations/joins.
  return { value: val, type: typeof(val) };
}