
/**
 * Module dependencies.
 */

var slice = [].slice;

/**
 * Expose `topology`.
 */

module.exports = topology;

/**
 * Expose `Topology`.
 */

module.exports.Topology = Topology;

/**
 * Wrap an array for chaining query criteria.
 */

function topology(pipes) {
  return new Topology(pipes);
}

/**
 * Construct a new `Topology` instance.
 */

function Topology(pipes) {
  this.pipes = pipes || [];
}

/**
 * The starting table or record for the query.
 *
 * @param {String} key
 * @param {Object} [val]
 * @api public
 */

Topology.prototype.start = function(key, val){
  return this.push('start', key);
}

Topology.prototype.where = function(key, val){
  return this.condition('eq', key, val);
}

/**
 * In a graph database, the data pointing _to_ this node.
 * In a relational/document database, the records with
 * a foreign key pointing to this record or set of records.
 *
 * Example:
 *
 *    topology().start('users')
 *      .incoming('friends')
 *      .incoming('friends');
 *
 * @param {String} key
 * @api public
 */

Topology.prototype.incoming = function(key){
  return this.relation('incoming', key);
}

/**
 * In a graph database, the data pointing _from_ this node.
 * In a relational/document database, the record this
 * record points to via its foreign key.
 *
 * Example:
 *
 *    topology().start('users')
 *      .outgoing('friends')
 *      .outgoing('friends');
 *
 * @param {String} key
 * @api public
 */

Topology.prototype.outgoing = function(key){
  return this.relation('outgoing', key);
}

/**
 * What the variable should be called for the data returned.
 * References the previous item in the topology.
 *
 * Example:
 *
 *    topology().start('users').as('people');
 *
 * @param {String} key
 * @api public
 */

Topology.prototype.as = function(key){
  return this.push('as', key);
}

Topology.prototype.eq = function(key){
  return this.push('eq', key);
}

/**
 * Append "greater than or equal to" condition to topology.
 *
 * Example:
 *
 *    topology().start('users').gte('likeCount', 10);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Topology.prototype.gte = function(key, val){
  return this.condition('gte', key, val);
}

/**
 * Append "greater than" condition to topology.
 *
 * Example:
 *
 *    topology().start('users').gt('likeCount', 10);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Topology.prototype.gt = function(key, val){
  return this.condition('gt', key, val);
}

/**
 * Append "less than or equal to" condition to topology.
 *
 * Example:
 *
 *    topology().start('users').lte('likeCount', 200);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Topology.prototype.lte = function(key, val){
  return this.condition('lte', key, val);
}

/**
 * Append "less than" condition to topology.
 *
 * Example:
 *
 *    topology().start('users').lt('likeCount', 200);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Topology.prototype.lt = function(key, val){
  return this.condition('lt', key, val);
}

/**
 * Tell adapter to insert `data` 
 * (or matching criteria) at this point.
 *
 * Example:
 *
 *    topology().start('users')
 *      .insert({ email: 'john.smith@gmail.com' });
 *
 * @api public
 */

Topology.prototype.insert = function(data){
  return this.action('insert', data);
}

/**
 * Tell adapter to update `data` 
 * (or matching criteria) at this point.
 *
 * Example:
 *
 *    topology().start('users').update({ likeCount: 0 });
 *
 * @api public
 */

Topology.prototype.update = function(data){
  return this.action('update', data);
}

/**
 * Tell adapter to remove `data` 
 * (or matching criteria) at this point.
 *
 * Example:
 *
 *    topology().start('users').remove();
 *
 * @api public
 */

Topology.prototype.remove = function(data){
  return this.action('remove', data);
}

/**
 * Tell adapter to query at this point.
 *
 * Example:
 *
 *    topology().start('users').query(fn);
 *
 * @api public
 */

Topology.prototype.query = function(fn){
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
 *    topology().start('users').pipe(req);
 *
 * @api public
 */

Topology.prototype.pipe = function(fn){
  return this.action('pipe', fn);
}

/**
 * Tell adapter to count at this point.
 *
 * Example:
 *
 *    topology().start('users').count(fn);
 *
 * @api public
 */

Topology.prototype.count = function(fn){
  return this.action('count', fn);
}

/**
 * Tell adapter to check if records matching criteria exist.
 *
 * Example:
 *
 *    topology().start('users').exists(fn);
 *
 * @api public
 */

Topology.prototype.exists = function(fn){
  return this.action('exists', fn);
}

/**
 * Sort ascending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the topology.
 *
 * Example:
 *
 *    topology().start('users').asc('createdAt');
 *
 * @param {String} key
 * @api public
 */

Topology.prototype.asc = function(key){
  return this.order(1, key);
}

/**
 * Sort descending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the topology.
 *
 * Example:
 *
 *    topology().start('users').desc('createdAt');
 *
 * @param {String} key
 * @api public
 */

Topology.prototype.desc = function(key){
  return this.order(-1, key);
}

Topology.prototype.returns = function(key){
  return this.push('return', key);
}

Topology.prototype.select = function(key){
  return this.push('select', key);
}

/**
 * Pushes a `"relation"` onto the topology.
 *
 * @param {String} type
 * @param {String} key
 * @api private
 */

Topology.prototype.relation = function(type, key){
  return this.push('relation', type, key);
}

/**
 * Pushes a `"condition"` onto the topology.
 *
 * @param {String} op Operator string
 * @param {String} key
 * @param {Object} val
 * @api private
 */

Topology.prototype.condition = function(op, key, val){
  return this.push('condition', op, key, val);
}

/**
 * Pushes an `"action"` onto the topology.
 *
 * Example:
 *
 *    topology().action('insert', {message: 'Test'});
 *    topology().action('insert', [{message: 'one.'}, {message: 'two.'}]);
 *
 * @param {String} type
 * @param {Object|Array} data The data to act on.
 * @api private
 */

Topology.prototype.action = function(type, data){
  return this.push('action', type, data);
}

/**
 * Pushes a sort direction onto the topology.

 * @param {Integer} dir   Direction it should point (-1, 1, 0).
 * @param {String}  key   The property to sort on.
 * @api private
 */

Topology.prototype.order = function(dir, key){
  return this.push('order', dir, key);
}

/**
 * Push criterion onto topology.
 * 
 * @api private
 */

Topology.prototype.push = function(){
  this.pipes.push(slice.call(arguments));
  return this;
}

/**
 * Get the number of pipes in the topology.
 */

Topology.prototype.size = function(){
  return this.pipes.length;
}

/**
 * Reset all pipes.
 */

Topology.prototype.reset = function(){
  this.pipes = [];
  return this;
}