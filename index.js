
/**
 * Module dependencies.
 */

var each = require('part-each-array');
var isArray = require('part-is-array');
var Constraint = require('./lib/constraint');
var validate = require('./lib/validate');
var validateConstraints = require('./lib/validate-constraints');
var filter = require('./lib/filter');
var subscriber = require('./lib/subscriber');

/**
 * Expose `query`.
 */

exports = module.exports = query;

/**
 * Expose `Query`.
 */

exports.Query = Query;

/**
 * Expose `Constraint`.
 */

exports.Constraint = Constraint;

/**
 * Wrap an array for chaining query criteria.
 *
 * @param {String} name A query name.
 * @return {Query} A query.
 * @api public
 */

function query(name) {
  return null == name
    ? new Query
    : exports.collection[name]
      ? exports.collection[name].clone()
      : (exports.collection[name] = new Query(name));
}

/**
 * Named queries.
 */

exports.collection = {};

/**
 * Queryable adapters.
 */

exports.adapters = [];

/**
 * Expose `filter`.
 */

exports.filter = filter;

/**
 * Validate query constraints.
 */

exports.validate = validateConstraints;

/**
 * Make an adapter queryable.
 *
 * XXX: The main reason for doing it this way
 *      is to not create circular dependencies.
 *
 * @chainable
 * @param {Adapter} An adapter object.
 * @return {Function} exports The main `query` function.
 * @api public
 */

exports.use = function(adapter){
  exports.adapters[adapter.name] = adapter;
  exports.adapters.push(adapter);
  return exports;
};

/**
 * Class representing a query.
 *
 * @class
 * @param {String} name A query instance's name.
 * @api public
 */

function Query(name) {
  this.name = name;
  this.constraints = [];
  this.selects = [];
  this.sorting = [];
  this.paging = {};
  // XXX: accomplish both joins and graph traversals.
  this.relations = [];
  // this.starts = []
  // this.groupings = {}
}

/**
 * Explicitly tell the query what adapters to use.
 *
 * If not specified, it will do its best to find
 * the adapter. If one or more are specified, the
 * first specified will be the default, and its namespace
 * can be left out of the resources used in the query
 * (e.g. `user` vs. `facebook.user` if `query().use('facebook').select('user')`).
 *
 * @chainable
 * @param {Mixed} name Name of the adapter, or the adapter object itself.
 *   In `package.json`, maybe this is under a `"key": "memory"` property.
 * @return {Query}
 * @api public
 */

Query.prototype.use = function(name){
  (this.adapters || (this.adapters = []))
    .push('string' === typeof name ? exports.adapters[name] : name);
  return this;
};

/**
 * The starting table or record for the query.
 *
 * @chainable
 * @param {String} key The starting table or record name.
 * @param {Object} val
 * @return {Query}
 * @api public
 */

Query.prototype.start = function(key, val){
  this._start = key;
  (this.starts || (this.starts = [])).push(queryModel(key));
  return this;
};

/**
 * Add a query pattern to be returned.
 * XXX: http://docs.neo4j.org/chunked/stable/query-return.html
 *
 * @param {String} key A query pattern that you want to be returned.
 * @return {Query}
 */

Query.prototype.returns = function(key){
  this.selects.push(queryAttr(key, this._start));
  return this;
};

/**
 * Start a SELECT query.
 *
 * @chainable
 * @param {String} key A record or table name.
 * @return {Query}
 * @api public
 */
Query.prototype.select = function(key){
  this._start = this._start || key;
  this.selects.push(queryAttr(key, this._start));
  return this;
};

/**
 * Add a WHERE clause.
 *
 * @param {String} key A record or table property/column name.
 * @return {Query}
 * @api public
 */
Query.prototype.where = function(key){
  this.context = key;
  return this;
};

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
 * @chainable
 * @param {String} key Name of the data coming to the start node.
 * @return {Query}
 * @api public
 */

Query.prototype.incoming = function(key){
  return this.relation('incoming', key);
};

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
 * @chainable
 * @param {String} key Name of the data going out from the start node.
 * @return {Query}
 * @api public
 */

Query.prototype.outgoing = function(key){
  return this.relation('outgoing', key);
};

/**
 * What the variable should be called for the data returned.
 * References the previous item in the query.
 *
 * Example:
 *
 *    query().start('users').as('people');
 *
 * @param {String} key The data's new variable name.
 * @return {Query}
 * @api public
 */

Query.prototype.as = function(key){
  // XXX: todo
  this.selects[this.selects.length - 1].alias = key;
  return this;
};

/**
 * Append constraint to query.
 *
 * Example:
 *
 *    query().start('users').where('likeCount').lte(200);
 *
 * @param {String} key The property to compare `val` to.
 * @param {Number|Date} val The number or date value.
 * @api public
 */

each(['eq', 'neq', 'gte', 'gt', 'lte', 'lt', 'nin', 'match'], function(operator){
  Query.prototype[operator] = function(val){
    return this.constraint(this.context, operator, val);
  }
});

/**
 * Check if the value exists within a set of values.
 *
 * @chainable
 * @param {Object} val The constraint value.
 * @return {Query}
 * @api public
 */

Query.prototype.contains = function(val){
  return this.constraint(this.context, 'in', val);
};

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
    'find'
  , 'remove'
  , 'pipe'
  , 'stream'
  , 'count'
  , 'exists'
], function(action){
  Query.prototype[action] = function(fn){
    return this.action(action).exec(fn);
  }
});

Query.prototype.all = Query.prototype.find;

/**
 * Create one or more records.
 *
 * This is different from the other actions 
 * in that it can take data (records) as arguments.
 *
 * Example:
 *
 *    query()
 *      .use('memory')
 *      .select('post')
 *      .create({ title: 'Foo' }, function(err, post){
 *
 *      });
 *
 * @param {Object} data Data record.
 * @param {Function} fn Function to be executed on record creation.
 * @return {Mixed} Whatever `fn` returns on the `create` action.
 * @api public
 */

Query.prototype.create = function(data, fn){
  return this.action('create', data).exec(fn);
};

/**
 * Update one or more records.
 *
 * This is different from the other actions
 * in that it can take data (records) as arguments.
 *
 * Example:
 *
 *    query()
 *      .use('memory')
 *      .select('post')
 *      .update({ title: 'Foo' }, function(err, post){
 *
 *      });
 *
 * @param {Object} data Data record.
 * @param {Function} Function to be executed on record update.
 * @return {Mixed} Whatever `fn` returns on the `update` action.
 * @api public
 */

Query.prototype.update = function(data, fn){
  return this.action('update', data).exec(fn);
};

/**
 * Return the first record that matches the query pattern.
 *
 * @param {Function} fn Function to execute on records after `find` action finishes.
 * @api public
 */

Query.prototype.first = function(fn){
  this.limit(1).action('find').exec(function(err, records){
    if (err) return fn(err);
    fn(err, records[0]);
  });
};

/**
 * Return the last record that matches the query pattern.
 *
 * @param {Function} fn Function to execute on records after `find` action finishes.
 * @api public
 */

Query.prototype.last = function(fn){
  this.limit(1).action('find').exec(function(err, records){
    if (err) return fn(err);
    fn(err, records[0]);
  });
};

/**
 * Add a record query LIMIT.
 *
 * @chainable
 * @param {Integer} val The record limit.
 * @return {Query}
 * @api public
 */

Query.prototype.limit = function(val){
  this.paging.limit = val;
  return this;
};

/**
 * Specify the page number.
 *
 * Use in combination with `limit` for calculating `offset`.
 *
 * @chainable
 * @param {Integer} val The page number.
 * @return {Query}
 * @api public
 */

Query.prototype.page = function(val){
  this.paging.page = val;
  return this;
};

/**
 * Specify the offset.
 *
 * @chainable
 * @param {Integer} val The offset value.
 * @return {Query}
 * @api public
 */
Query.prototype.offset = function(val){
  this.paging.offset = val;
  return this;
};

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
 * @chainable
 * @param {String} key A property name.
 * @return {Query}
 * @api public
 */

Query.prototype.asc = function(key){
  return this.sort(key, 1);
};

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
 * @chainable
 * @param {String} key A property name.
 * @return {Query}
 * @api public
 */

Query.prototype.desc = function(key){
  return this.sort(key, -1);
};

/**
 * Pushes a `"relation"` onto the query.
 *
 * @chainable
 * @param {String} dir The direction.
 * @param {String} key The key.
 * @return {Query}
 * @api private
 */

Query.prototype.relation = function(dir, key){
  var attr = queryAttr(key, this._start);
  attr.direction = dir;
  this.relations.push(attr);
  return this;
};

/**
 * Pushes a `"constraint"` onto the query.
 *
 * @chainable
 * @param {String} key The constraint key.
 * @param {String} op Operator string
 * @param {Object} val The constraint value.
 * @return {Query}
 * @api public
 *
 * @see http://en.wikipedia.org/wiki/Lagrange_multiplier
 */

Query.prototype.constraint = function(key, op, val){
  this.constraints.push(new Constraint(key, op, val, this._start));
  return this;
};

/**
 * Pushes an `"action"` onto the query.
 *
 * Example:
 *
 *    query().action('insert', { message: 'Test' });
 *    query().action('insert', [ { message: 'one.' }, { message: 'two.' } ]);
 *
 * @chainable
 * @param {String} type The action type.
 * @param {Object|Array} data The data to act on.
 * @return {Query}
 * @api private
 */

Query.prototype.action = function(type, data){
  this.type = type
  this.data = data ? isArray(data) ? data : [data] : undefined;
  return this;
};

// XXX: only do if it decreases final file size
// each(['find', 'create', 'update', 'delete'])

/**
 * Pushes a sort direction onto the query.
 *
 * @chainable
 * @param {String} key The property to sort on.
 * @param {Integer} dir Direction it should point (-1, 1, 0).
 * @return {Query}
 * @api private
 */

Query.prototype.sort = function(key, dir){
  var attr = queryAttr(key, this._start);
  attr.direction = key;
  this.sorting.push(attr);
  return this;
};

/**
 * A way to log the query criteria,
 * so you can see if the adapter supports it.
 *
 * @chainable
 * @param {Function} fn The query criteria logging function
 * @return {Query}
 * @api public
 */

Query.prototype.explain = function(fn){
  this._explain = fn;
  return this;
};

/**
 * Clone the current `Query` object.
 *
 * @return {Query} A cloned `Query` object.
 * @api public
 */

Query.prototype.clone = function(){
  return new Query(this.name);
};

/**
 * Execute the query.
 * XXX: For now, only one query per adapter.
 *      Later, you can query across multiple adapters
 *
 * @see http://en.wikipedia.org/wiki/Query_optimizer
 * @see http://en.wikipedia.org/wiki/Query_plan
 * @see http://homepages.inf.ed.ac.uk/libkin/teach/dbs12/set5.pdf
 * @param {Function} fn Function that gets called on adapter execution.
 * @return {Mixed} Whatever `fn` returns on execution.
 * @api public
 */

Query.prototype.exec = function(fn){
  this.context = this._start = undefined;
  var adapter = this.adapters && this.adapters[0] || exports.adapters[0];
  this.validate(function(){});
  if (this.errors && this.errors.length) return fn(this.errors);
  if (!this.selects[0]) throw new Error('Must `.select(resourceName)`');
  return adapter.exec(this, fn);
};

/**
 * Validate the query on all adapters.
 *
 * @param {Function} fn Function called on query validation.
 * @api public
 */

Query.prototype.validate = function(fn){
  var adapter = this.adapters && this.adapters[0] || exports.adapters[0];
  validate(this, adapter, fn);
};

/**
 * Subscribe to a type of query.
 *
 * @param {Function} fn Function executed on each subscriber output.
 * @api public
 */

Query.prototype.subscribe = function(fn){
  var self = this;
  subscriber.output(this.type, function(record){
    if (self.test(record)) fn(record);
  });
};

/**
 * Define another query on the parent scope.
 *
 * XXX: wire this up with the resource (for todomvc).
 *
 * @param {String} name A query name.
 * @return {Query} A `Query` object.
 * @api public
 */

Query.prototype.query = function(name) {
  return query(name);
};

function queryModel(key) {
  key = key.split('.');

  if (2 === key.length)
    return { adapter: key[0], resource: key[1], ns: key[0] + '.' + key[1] };
  else
    return { resource: key[0], ns: key[0] }; // XXX: adapter: adapter.default()
}

/**
 * Variables used in query.
 */

function queryAttr(val, start){
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

function queryValue(val) {
  // XXX: eventually handle relations/joins.
  return { value: val, type: typeof(val) };
}