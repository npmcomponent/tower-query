
/**
 * Module dependencies.
 */

// maybe this query module only builds a dsl,
// and the compiling happens in tower-graph?
var Topology = require('tower-topology').Topology
  , slice = [].slice;

/**
 * Expose `query`.
 */

var exports = module.exports = query;

/**
 * Expose `Query`.
 */

exports.Query = Query;

/**
 * Wrap an array for chaining query criteria.
 */

function query(criteria) {
  return new Query(criteria);
}

/**
 * Construct a new `Query` instance.
 */

function Query(criteria) {
  this.criteria = criteria || [];
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

Query.prototype.where = function(key, val){
  return this.condition('eq', key, val);
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

Query.prototype.eq = function(key){
  return this.push('eq', key);
}

/**
 * Append "greater than or equal to" condition to query.
 *
 * Example:
 *
 *    query().start('users').gte('likeCount', 10);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Query.prototype.gte = function(key, val){
  return this.condition('gte', key, val);
}

/**
 * Append "greater than" condition to query.
 *
 * Example:
 *
 *    query().start('users').gt('likeCount', 10);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Query.prototype.gt = function(key, val){
  return this.condition('gt', key, val);
}

/**
 * Append "less than or equal to" condition to query.
 *
 * Example:
 *
 *    query().start('users').lte('likeCount', 200);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Query.prototype.lte = function(key, val){
  return this.condition('lte', key, val);
}

/**
 * Append "less than" condition to query.
 *
 * Example:
 *
 *    query().start('users').lt('likeCount', 200);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Query.prototype.lt = function(key, val){
  return this.condition('lt', key, val);
}

Query.prototype.find = function(fn){
  return this.action('find', fn);
}

/**
 * Tell adapter to insert `data` 
 * (or matching criteria) at this point.
 *
 * Example:
 *
 *    query().start('users')
 *      .insert({ email: 'john.smith@gmail.com' });
 *
 * @api public
 */

Query.prototype.insert = function(data){
  return this.action('insert', data);
}

/**
 * Tell adapter to update `data` 
 * (or matching criteria) at this point.
 *
 * Example:
 *
 *    query().start('users').update({ likeCount: 0 });
 *
 * @api public
 */

Query.prototype.update = function(data){
  return this.action('update', data);
}

/**
 * Tell adapter to remove `data` 
 * (or matching criteria) at this point.
 *
 * Example:
 *
 *    query().start('users').remove();
 *
 * @api public
 */

Query.prototype.remove = function(data){
  return this.action('remove', data);
}

/**
 * Tell adapter to query at this point.
 *
 * Example:
 *
 *    query().start('users').query(fn);
 *
 * @api public
 */

Query.prototype.query = function(fn){
  return this.action('query', fn);
}

/**
 * Tell adapter to pipe data into `fn` at this point.
 *
 * XXX: Not sure if this is an "action" 
 * or a different class of operations.
 *
 * Example:
 *
 *    query().start('users').pipe(req);
 *
 * @api public
 */

Query.prototype.pipe = function(fn){
  return this.action('pipe', fn);
}

/**
 * Tell adapter to count at this point.
 *
 * Example:
 *
 *    query().start('users').count(fn);
 *
 * @api public
 */

Query.prototype.count = function(fn){
  return this.action('count', fn);
}

/**
 * Tell adapter to check if records matching criteria exist.
 *
 * Example:
 *
 *    query().start('users').exists(fn);
 *
 * @api public
 */

Query.prototype.exists = function(fn){
  return this.action('exists', fn);
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
 * Pushes a `"condition"` onto the query.
 *
 * @param {String} op Operator string
 * @param {String} key
 * @param {Object} val
 * @api private
 */

Query.prototype.condition = function(op, key, val){
  return this.push('condition', op, key, val);
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
 * Compile query to a `Topology`.
 */

Query.prototype.compile = function(){
  var topology = new Topology;
  
  return topology;
}