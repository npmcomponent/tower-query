
/**
 * Expose `validate`.
 */

module.exports = validate;

/**
 * Add validations to perform before this is executed.
 *
 * XXX: not implemented.
 */

function validate(query, adapter, fn) {
  // XXX: only supports one action at a time atm.
  var constraints = query.constraints;
  var type = query.type;
  query.errors = [];
  // XXX: collect validators for model and for each attribute.
  // var modelValidators = model(criteria[0][1].ns).validators;
  for (var i = 0, n = constraints.length; i < n; i++) {
    var constraint = constraints[i];

    if (!adapter.action.exists(constraint.left.model + '.' + type))
      continue;

    var stream = adapter.action(constraint.left.model + '.' + type);
    var param = stream.params && stream.params[constraint.left.attr];
    if (param && param.validate(query, constraint)) {
      // $ tower list ec2:group --name 'hello-again-again,hello-again'
      constraint.right.value = param.typecast(constraint.right.value);
    }
  }

  query.errors.length ? fn(query.errors) : fn();
}