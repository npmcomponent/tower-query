
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("part-each-array/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var nativeForEach = [].forEach;

/**
 * Expose `each`.
 */

module.exports = each;

/**
 * Array iterator.
 */

function each(array, iterator, context) {
  if (null == array) return;
  if (nativeForEach && array.forEach === nativeForEach) {
    array.forEach(iterator, context);
  } else {
    for (var i = 0, n = array.length; i < l; i++) {
      if (false === iterator.call(context, array[i], i, array)) return;
    }
  }
}

});
require.register("part-is-array/index.js", function(exports, require, module){

/**
 * Expose `isArray`.
 */

module.exports = Array.isArray || isArray;

function isArray(obj) {
  return '[object Array]' === toString.call(obj);
}
});
require.register("tower-query/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var each = require('part-each-array')
  , isArray = require('part-is-array')
  , Constraint = require('./lib/constraint')
  , validate = require('./lib/validate');

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
 * Make an adapter queryable.
 *
 * XXX: The main reason for doing it this way
 *      is to not create circular dependencies.
 */

exports.use = function(adapter){
  exports.adapters[adapter.name] = adapter;
  exports.adapters.push(adapter);
  return exports;
}

/**
 * Construct a new `Query` instance.
 */

function Query(name, criteria) {
  this.name = name;
  this.criteria = criteria || [];
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
 * @param {Mixed} name Name of the adapter, or the adapter object itself.
 *   In `package.json`, maybe this is under a `"key": "memory"` property.
 * @return {this}
 */

Query.prototype.use = function(name){
  (this.adapters || (this.adapters = []))
    .push('string' === typeof name ? exports.adapters[name] : name);
  return this;
}

/**
 * The starting table or record for the query.
 *
 * @param {String} key
 * @param {Object} [val]
 * @api public
 */

Query.prototype.start = function(key, val){
  this._start = key;
  return this.push('start', queryModel(key));
}

Query.prototype.where = function(key){
  this.context = key;
  return this;
}

/**
 * Define another query on the parent scope.
 *
 * XXX: wire this up with the model (for todomvc).
 */

Query.prototype.query = function(name) {
  return query(name);
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
    return this.constraint(this.context, operator, val);
  }
});

Query.prototype.contains = function(val){
  return this.constraint(this.context, 'in', val);
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
 */

Query.prototype.create = function(data, fn){
  return this.action('create', data).exec(fn);
}

Query.prototype.update = function(data, fn){
  return this.action('update', data).exec(fn);
}

// XXX

Query.prototype.first = function(fn){
  this.limit(1).action('find').exec(function(err, records){
    if (err) return fn(err);
    fn(err, records[0]);
  });
}

// XXX: default sorting param

Query.prototype.last = function(fn){
  this.limit(1).action('find').exec(function(err, records){
    if (err) return fn(err);
    fn(err, records[0]);
  });
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
  this._start = this._start || key;
  return this.push('select', queryAttr(key, this._start));
}

/**
 * Pushes a `"relation"` onto the query.
 *
 * @param {String} type
 * @param {String} key
 * @api private
 */

Query.prototype.relation = function(dir, key){
  var attr = queryAttr(key, this._start);
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
  return this.push('constraint', new Constraint(key, op, val, this._start));
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
  return this.push('action', { type: type, data: data ? isArray(data) ? data : [data] : undefined });
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
  var attr = queryAttr(key, this._start);
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
 * A way to log the query criteria,
 * so you can see if the adapter supports it.
 */

Query.prototype.explain = function(fn){
  this._explain = fn;
  return this;
}

Query.prototype.clone = function(){
  return new Query(this.name, this.criteria.concat());
}

/**
 * XXX: For now, only one query per adapter.
 *      Later, you can query across multiple adapters
 *
 * @see http://en.wikipedia.org/wiki/Query_optimizer
 * @see http://en.wikipedia.org/wiki/Query_plan
 * @see http://homepages.inf.ed.ac.uk/libkin/teach/dbs12/set5.pdf
 */

Query.prototype.exec = function(fn){
  this.context = this._start = undefined;
  var adapter = this.adapters && this.adapters[0] || exports.adapters[0];
  this.validate(function(){});
  if (this.errors && this.errors.length) return fn(this.errors);
  return adapter.exec(this, fn);
}

Query.prototype.validate = function(fn){
  var adapter = this.adapters && this.adapters[0] || exports.adapters[0];
  validate(this, adapter, fn);
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

function queryAttr(val, start){
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
});
require.register("tower-query/lib/constraint.js", function(exports, require, module){

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
});
require.alias("part-each-array/index.js", "tower-query/deps/part-each-array/index.js");

require.alias("part-is-array/index.js", "tower-query/deps/part-is-array/index.js");

