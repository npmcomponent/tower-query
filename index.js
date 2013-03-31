
/**
 * Module dependencies.
 */

var slice = [].slice;

/**
 * Expose `pipeline`.
 */

module.exports = pipeline;

/**
 * Expose `Pipeline`.
 */

module.exports.Pipeline = Pipeline;

/**
 * Wrap an array for chaining query criteria.
 */

function pipeline(pipes) {
  return new Pipeline(pipes);
}

/**
 * Construct a new `Pipeline` instance.
 */

function Pipeline(pipes) {
  this.pipes = pipes || [];
}

/**
 * The starting table or record for the query.
 *
 * @param {String} key
 * @param {Object} [val]
 * @api public
 */

Pipeline.prototype.start = function(key, val){
  return this.push('start', key);
}

Pipeline.prototype.where = function(key, val){
  return this.condition('eq', key, val);
}

/**
 * In a graph database, the data pointing _to_ this node.
 * In a relational/document database, the records with
 * a foreign key pointing to this record or set of records.
 *
 * Example:
 *
 *    pipeline().start('users')
 *      .incoming('friends')
 *      .incoming('friends');
 *
 * @param {String} key
 * @api public
 */

Pipeline.prototype.incoming = function(key){
  return this.relation('incoming', key);
}

/**
 * In a graph database, the data pointing _from_ this node.
 * In a relational/document database, the record this
 * record points to via its foreign key.
 *
 * Example:
 *
 *    pipeline().start('users')
 *      .outgoing('friends')
 *      .outgoing('friends');
 *
 * @param {String} key
 * @api public
 */

Pipeline.prototype.outgoing = function(key){
  return this.relation('outgoing', key);
}

/**
 * What the variable should be called for the data returned.
 * References the previous item in the pipeline.
 *
 * Example:
 *
 *    pipeline().start('users').as('people');
 *
 * @param {String} key
 * @api public
 */

Pipeline.prototype.as = function(key){
  return this.push('as', key);
}

/**
 * Append "greater than or equal to" condition to pipeline.
 *
 * Example:
 *
 *    pipeline().start('users').gte('likeCount', 10);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Pipeline.prototype.gte = function(key, val){
  return this.condition('gte', key, val);
}

/**
 * Append "greater than" condition to pipeline.
 *
 * Example:
 *
 *    pipeline().start('users').gt('likeCount', 10);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Pipeline.prototype.gt = function(key, val){
  return this.condition('gt', key, val);
}

/**
 * Append "less than or equal to" condition to pipeline.
 *
 * Example:
 *
 *    pipeline().start('users').lte('likeCount', 200);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Pipeline.prototype.lte = function(key, val){
  return this.condition('lte', key, val);
}

/**
 * Append "less than" condition to pipeline.
 *
 * Example:
 *
 *    pipeline().start('users').lt('likeCount', 200);
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

Pipeline.prototype.lt = function(key, val){
  return this.condition('lt', key, val);
}

/**
 * Tell adapter to insert `data` 
 * (or matching criteria) at this point.
 *
 * Example:
 *
 *    pipeline().start('users')
 *      .insert({ email: 'john.smith@gmail.com' });
 *
 * @api public
 */

Pipeline.prototype.insert = function(data){
  return this.action('insert', data);
}

/**
 * Tell adapter to update `data` 
 * (or matching criteria) at this point.
 *
 * Example:
 *
 *    pipeline().start('users').update({ likeCount: 0 });
 *
 * @api public
 */

Pipeline.prototype.update = function(data){
  return this.action('update', data);
}

/**
 * Tell adapter to remove `data` 
 * (or matching criteria) at this point.
 *
 * Example:
 *
 *    pipeline().start('users').remove();
 *
 * @api public
 */

Pipeline.prototype.remove = function(data){
  return this.action('remove', data);
}

/**
 * Tell adapter to query at this point.
 *
 * Example:
 *
 *    pipeline().start('users').query(fn);
 *
 * @api public
 */

Pipeline.prototype.query = function(fn){
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
 *    pipeline().start('users').pipe(req);
 *
 * @api public
 */

Pipeline.prototype.pipe = function(fn){
  return this.action('pipe', fn);
}

/**
 * Tell adapter to count at this point.
 *
 * Example:
 *
 *    pipeline().start('users').count(fn);
 *
 * @api public
 */

Pipeline.prototype.count = function(fn){
  return this.action('count', fn);
}

/**
 * Tell adapter to check if records matching criteria exist.
 *
 * Example:
 *
 *    pipeline().start('users').exists(fn);
 *
 * @api public
 */

Pipeline.prototype.exists = function(fn){
  return this.action('exists', fn);
}

/**
 * Sort ascending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the pipeline.
 *
 * Example:
 *
 *    pipeline().start('users').asc('createdAt');
 *
 * @param {String} key
 * @api public
 */

Pipeline.prototype.asc = function(key){
  return this.order(1, key);
}

/**
 * Sort descending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the pipeline.
 *
 * Example:
 *
 *    pipeline().start('users').desc('createdAt');
 *
 * @param {String} key
 * @api public
 */

Pipeline.prototype.desc = function(key){
  return this.order(-1, key);
}

/**
 * Pushes a `"relation"` onto the pipeline.
 *
 * @param {String} type
 * @param {String} key
 * @api private
 */

Pipeline.prototype.relation = function(type, key){
  return this.push('relation', type, key);
}

/**
 * Pushes a `"condition"` onto the pipeline.
 *
 * @param {String} op Operator string
 * @param {String} key
 * @param {Object} val
 * @api private
 */

Pipeline.prototype.condition = function(op, key, val){
  return this.push('condition', op, key, val);
}

/**
 * Pushes an `"action"` onto the pipeline.
 *
 * Example:
 *
 *    pipeline().action('insert', {message: 'Test'});
 *    pipeline().action('insert', [{message: 'one.'}, {message: 'two.'}]);
 *
 * @param {String} type
 * @param {Object|Array} data The data to act on.
 * @api private
 */

Pipeline.prototype.action = function(type, data){
  return this.push('action', type, data);
}

/**
 * Pushes a sort direction onto the pipeline.

 * @param {Integer} dir   Direction it should point (-1, 1, 0).
 * @param {String}  key   The property to sort on.
 * @api private
 */

Pipeline.prototype.order = function(dir, key){
  return this.push('order', dir, key);
}

/**
 * Push criterion onto pipeline.
 * 
 * @api private
 */

Pipeline.prototype.push = function(){
  this.pipes.push(slice.call(arguments));
  return this;
}

/**
 * Get the number of pipes in the pipeline.
 */

Pipeline.prototype.size = function(){
  return this.pipes.length;
}

/**
 * Reset all pipes.
 */

Pipeline.prototype.reset = function(){
  this.pipes = [];
  return this;
}