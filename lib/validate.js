
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
  query.errors = [];
  var criteria = query.criteria;
  var action = criteria[criteria.length - 1][1].type;
  var ctx = query;
  // XXX: collect validators for model and for each attribute.
  // var modelValidators = model(criteria[0][1].ns).validators;
  for (var i = 0, n = criteria.length; i < n; i++) {
    if ('constraint' !== criteria[i][0]) continue;

    var constraint = criteria[i][1];
    // XXX: tmp, way to load
    model(constraint.left.ns);

    if (stream.exists(constraint.left.ns + '.' + action)) {
      var _action = stream(constraint.left.ns + '.' + action);//.params;
      var params = _action.params;
      if (params[constraint.left.attr]) {
        // XXX: refactor
        params[constraint.left.attr].validate(ctx, constraint);
        // $ tower list ec2:group --name 'hello-again-again,hello-again'
        constraint.right.value =
          params[constraint.left.attr].typecast(constraint.right.value);
      }
    }
  }

  // return query.push('validate', fn);
  query.errors.length ? fn(query.errors) : fn();
}