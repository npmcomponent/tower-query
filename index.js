
/**
 * Module dependencies.
 */

// maybe this query module only builds a dsl,
// and the compiling happens in tower-graph?
var Topology = require('tower-topology').Topology
  , adapter = require('tower-adapter')
  , stream = require('tower-stream')
  , each = require('part-each-array')
  , isArray = require('part-is-array')
  , context, start; // used in `.where`

/**
 * Expose `query`.
 */

exports = module.exports = query;

/**
 * Expose `Query`.
 */

exports.Query = Query;

/**
 * Wrap an array for chaining query criteria.
 */

function query(name) {
  return null == name
    ? new Query
    : queries[name] || (queries[name] = new Query(name));
}

/**
 * Named queries.
 */

var queries = exports.queries = {};

/**
 * Construct a new `Query` instance.
 */

function Query(name) {
  start = undefined;
  this.name = name;
  this.criteria = [];
}

/**
 * The starting table or record for the query.
 *
 * @param {String} key
 * @param {Object} [val]
 * @api public
 */

Query.prototype.start = function(key, val){
  start = key;
  return this.push('start', queryModel(key));
}

Query.prototype.where = function(key){
  // this._key = key;
  context = key;
  return this;
}

/**
 * In a graph database, the data pointing _to_ this node.
 * In a relational/document database, the records with
 * a foreign key pointing to this record or set of records.
 *
 * Example:
 *
 *    query().start('users')
 *      .incoming('friends')
 *      .incoming('friends');
 *
 * @param {String} key
 * @api public
 */

Query.prototype.incoming = function(key){
  return this.relation('incoming', key);
}

/**
 * In a graph database, the data pointing _from_ this node.
 * In a relational/document database, the record this
 * record points to via its foreign key.
 *
 * Example:
 *
 *    query().start('users')
 *      .outgoing('friends')
 *      .outgoing('friends');
 *
 * @param {String} key
 * @api public
 */

Query.prototype.outgoing = function(key){
  return this.relation('outgoing', key);
}

/**
 * What the variable should be called for the data returned.
 * References the previous item in the query.
 *
 * Example:
 *
 *    query().start('users').as('people');
 *
 * @param {String} key
 * @api public
 */

Query.prototype.as = function(key){
  return this.push('as', key);
}

/**
 * Append constraint to query.
 *
 * Example:
 *
 *    query().start('users').where('likeCount').lte(200);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

each(['eq', 'neq', 'gte', 'gt', 'lte', 'lt', 'nin', 'match'], function(operator){
  Query.prototype[operator] = function(val){
    return this.constraint(context, operator, val);
  }
});

Query.prototype.contains = function(val){
  return this.constraint(context, 'in', val);
}

/**
 * Append action to query, then execute.
 *
 * Example:
 *
 *    query().start('users')
 *      .insert({ email: 'john.smith@gmail.com' });
 *
 *    query().start('users').query(fn);
 *
 * @api public
 */

each([
    'query'
  , 'find'
  , 'remove'
  , 'pipe'
  , 'stream'
  , 'count'
  , 'exists'
], function(action){
  Query.prototype[action] = function(fn){
    return this.action(action).execute(fn);
  }
});

/**
 * Create one or more records.
 *
 * This is different from the other actions 
 * in that it can take data (records) as arguments.
 */

Query.prototype.create = function(data, fn){
  return this.action('create', data).execute(fn);
}

Query.prototype.update = function(data, fn){
  return this.action('update', data).execute(fn);
}

/**
 * Add validations to perform before this is executed.
 *
 * XXX: not implemented.
 */

Query.prototype.validate = function(fn){
  // XXX: only supports one action at a time atm.
  this.errors = [];
  var criteria = this.criteria;
  var action = criteria[criteria.length - 1][1];
  var ctx = this;
  // XXX: collect validators for model and for each attribute.
  // var modelValidators = model(criteria[0][1].ns).validators;
  for (var i = 0, n = criteria.length; i < n; i++) {
    if ('constraint' !== criteria[i][0]) continue;

    var constraint = criteria[i][1];

    if (stream.exists(constraint.left.ns + '.' + action)) {
      var _action = stream(constraint.left.ns + '.' + action);//.params;
      var params = _action.attrs;
      if (params[constraint.left.attr]) {
        params[constraint.left.attr].validators.forEach(function(validator){
          validator(ctx, constraint);
        });
      }
    }
  }
  // return this.push('validate', fn);
  console.log(this.errors)
  this.errors.length ? fn(this.errors) : fn();
}

/**
 * Sort ascending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the query.
 *
 * Example:
 *
 *    query().start('users').asc('createdAt');
 *
 * @param {String} key
 * @api public
 */

Query.prototype.asc = function(key){
  return this.order(1, key);
}

/**
 * Sort descending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the query.
 *
 * Example:
 *
 *    query().start('users').desc('createdAt');
 *
 * @param {String} key
 * @api public
 */

Query.prototype.desc = function(key){
  return this.order(-1, key);
}

Query.prototype.returns = function(key){
  return this.push('return', key);
}

Query.prototype.select = function(key){
  start = start || key;
  return this.push('select', queryAttr(key));
}

/**
 * Pushes a `"relation"` onto the query.
 *
 * @param {String} type
 * @param {String} key
 * @api private
 */

Query.prototype.relation = function(dir, key){
  var attr = queryAttr(key);
  attr.direction = dir;
  return this.push('relation', attr);
}

/**
 * Pushes a `"constraint"` onto the query.
 *
 * @param {String} op Operator string
 * @param {String} key
 * @param {Object} val
 * @api public
 *
 * @see http://en.wikipedia.org/wiki/Lagrange_multiplier
 */

Query.prototype.constraint = function(key, op, val){
  return this.push('constraint', {
      left: queryAttr(key)
    , operator: op
    , right: queryValue(val)
  });
}

/**
 * Pushes an `"action"` onto the query.
 *
 * Example:
 *
 *    query().action('insert', { message: 'Test' });
 *    query().action('insert', [ { message: 'one.' }, { message: 'two.' } ]);
 *
 * @param {String} type
 * @param {Object|Array} data The data to act on.
 * @api private
 */

Query.prototype.action = function(type, data){
  return this.push('action', type, data ? isArray(data) ? data : [data] : undefined);
}

// XXX: only do if it decreases final file size
// each(['find', 'create', 'update', 'delete'])

/**
 * Pushes a sort direction onto the query.
 *
 * @param {Integer} dir   Direction it should point (-1, 1, 0).
 * @param {String}  key   The property to sort on.
 * @api private
 */

Query.prototype.order = function(dir, key){
  var attr = queryAttr(key);
  attr.direction = key;
  return this.push('order', attr);
}

/**
 * Push criterion onto query.
 * 
 * @api private
 */

Query.prototype.push = function(type, data){
  this.criteria.push([type, data]);
  return this;
}

/**
 * Get the number of criteria in the query.
 */

Query.prototype.size = function(){
  return this.criteria.length;
}

/**
 * Reset all criteria.
 */

Query.prototype.reset = function(){
  this.criteria = [];
  return this;
}

/**
 * XXX: For now, only one query per adapter.
 *      Later, you can query across multiple adapters
 */

Query.prototype.exec = function(fn){
  context = start = undefined;
  // XXX: only support one adapter for now.
  if (!this._adapter) this._adapter = 'memory';
  // XXX: do validations right here before going to the adapter.
  return adapter(this._adapter).execute(this.criteria, fn);
}

/**
 * Explicitly tell the query what adapters to use.
 *
 * If not specified, it will do its best to find
 * the adapter. If one or more are specified, the
 * first specified will be the default, and its namespace
 * can be left out of the models used in the query
 * (e.g. `user` vs. `facebook.user` if `query().use('facebook').select('user')`).
 *
 * @param {String} name Name of the adapter.
 *   In `package.json`, maybe this is under a `"key": "memory"` property.
 * @return {this}
 */

Query.prototype.use = function(name){
  this._adapter = name;
  return this;
}

/**
 * Compile query to a `Topology`.
 *
 * Builds an acyclic dependency graph.
 *
 * Make sure the graph is **acyclic** (no directed cycles)!
 * @see http://stackoverflow.com/questions/261573/best-algorithm-for-detecting-cycles-in-a-directed-graph
 */

Query.prototype.topology = function(){
  return queryToTopology(this);
};

/**
 * A way to log the query criteria,
 * so you can see if the adapter supports it.
 */

Query.prototype.explain = function(fn){
  this._explain = fn;
  return this;
}

/**
 * Maybe make this a separate module, `tower-query-to-topology`.
 */

function queryToTopology(q) {
  var topology = new Topology
    , criteria = q.criteria
    , name;

  // XXX: this function should just split the criteria by model/adapter.
  // then the adapter
  for (var i = 0, n = criteria.length; i < n; i++) {
    var criterion = criteria[i];
    switch (criterion[0]) {
      case 'select':
      case 'start':
        // XXX: since this is just going to support one adapter at a time for now,
        // need to pass criteria off to it.
        topology.stream(name = criterion[1].ns + '.find', { constraints: [] });
        break;
      case 'constraint':
        topology.streams[name].constraints.push(criterion);
        break;
    }
  }

  return topology;
}

function queryModel(key) {
  key = key.split('.');

  if (2 === key.length)
    return { adapter: key[0], model: key[1], ns: key[0] + '.' + key[1] };
  else
    return { model: key[0], ns: key[0] }; // XXX: adapter: adapter.default()
}

/**
 * Variables used in query.
 */

function queryAttr(val){
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

function queryValue(val) {
  // XXX: eventually handle relations/joins.
  return { value: val, type: typeof(val) };
}