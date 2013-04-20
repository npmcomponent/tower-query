
/**
 * Module dependencies.
 */

// maybe this query module only builds a dsl,
// and the compiling happens in tower-graph?
var Topology = require('tower-topology').Topology
  , adapter = require('tower-adapter')
  , each = require('part-each-array')
  , slice = [].slice
  // used in `.where`
  , context;

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
  return this.push('start', key);
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

each(['eq', 'neq', 'gte', 'gt', 'lte', 'lt', 'in', 'nin'], function(operator){
  Query.prototype[operator] = function(val){
    return this.constraint(context, operator, val);
  }
});

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
  , 'update'
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
  return this.push('select', key);
}

/**
 * Pushes a `"relation"` onto the query.
 *
 * @param {String} type
 * @param {String} key
 * @api private
 */

Query.prototype.relation = function(type, key){
  return this.push('relation', type, key);
}

/**
 * Pushes a `"constraint"` onto the query.
 *
 * @param {String} op Operator string
 * @param {String} key
 * @param {Object} val
 * @api private
 */

Query.prototype.constraint = function(key, op, val){
  return this.push('constraint', key, op, val);
}

/**
 * Pushes an `"action"` onto the query.
 *
 * Example:
 *
 *    query().action('insert', {message: 'Test'});
 *    query().action('insert', [{message: 'one.'}, {message: 'two.'}]);
 *
 * @param {String} type
 * @param {Object|Array} data The data to act on.
 * @api private
 */

Query.prototype.action = function(type, data){
  return this.push('action', type, data);
}

// XXX: only do if it decreases final file size
// each(['find', 'create', 'update', 'delete'])

/**
 * Pushes a sort direction onto the query.

 * @param {Integer} dir   Direction it should point (-1, 1, 0).
 * @param {String}  key   The property to sort on.
 * @api private
 */

Query.prototype.order = function(dir, key){
  return this.push('order', dir, key);
}

/**
 * Push criterion onto query.
 * 
 * @api private
 */

Query.prototype.push = function(){
  this.criteria.push(slice.call(arguments));
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
  // XXX: only support one adapter for now.
  if (!this._adapter) throw new Error('Must `use` an adapter');
  // adapter.execute returns a `Topology` instance.
  return adapter(this._adapter).execute(this.criteria, fn);
}

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

  if (q._explain) q._explain(criteria);

  var adapters = {};

  // XXX: this function should just split the criteria by model/adapter.
  // then the adapter
  for (var i = 0, n = criteria.length; i < n; i++) {
    var criterion = criteria[i];
    switch (criterion[0]) {
      case 'select':
      case 'start':
        // XXX: since this is just going to support one adapter at a time for now,
        // need to pass criteria off to it.
        var adapterName = adapterFor(criterion[1]);
        topology.stream(name = criterion[1] + '.find', { constraints: [] });
        break;
      case 'constraint':
        topology.streams[name].constraints.push(criterion);
        break;
    }
  }

  return topology;
}

/**
 * user
 * facebook.user
 * twitter.user
 * users
 */

function adapterFor(path) {
  if (adapter.map[path]) return adapter(adapter.map[path]);

  // need to get plural/singular map of model (user/users)
  var parts = path.split('.');
  // 3 === [adapter, model, attr|relation]
  // 2 === [adapter, model]
  // 2 === [model, attr]
  // 1 === [model]
  // 1 === [attr]

  var adapters = adapter.instances;

  for (var adapterName in adapters) {
    var models = adapters[adapterName].resources;
    for (var modelName in models) {
      adapter.map[adapterName + '.' + modelName] = adapterName;
    }
  }

  // console.log(adapter.map)
}

/**
 * Lookup for adapter by model/adapter/stream name.
 */

adapter.map = {};