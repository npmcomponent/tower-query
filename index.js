
/**
 * Module dependencies.
 */

var slice = [].slice;

/**
 * Expose `pipeline`.
 */

module.exports = pipeline;

/**
 * Wrap an array for chaining query criteria.
 *
 * XXX: should this be a class instead?
 */

function pipeline(criteria) {
  pipeline.criteria = criteria || [];
  return pipeline;
}

/**
 * The starting table or record for the query.
 *
 * @param {String} key
 * @param {Object} [val]
 * @api public
 */

pipeline.start = function(key, val){
  return this.push('start', key);
}

pipeline.where = function(key, val){
  return this.condition('eq', key, val);
}

/**
 * In a graph database, the data pointing _to_ this node.
 * In a relational/document database, the records with
 * a foreign key pointing to this record or set of records.
 *
 * @param {String} key
 * @api public
 */

pipeline.incoming = function(key){
  return this.relation('incoming', key);
}

/**
 * In a graph database, the data pointing _from_ this node.
 * In a relational/document database, the record this
 * record points to via its foreign key.
 *
 * @param {String} key
 * @api public
 */

pipeline.outgoing = function(key){
  return this.relation('outgoing', key);
}

/**
 * What the variable should be called for the data returned.
 * References the previous item in the pipeline.
 *
 * @param {String} key
 * @api public
 */

pipeline.as = function(key){
  return this.push('as', key);
}

/**
 * Append "greater than or equal to" condition to pipeline.
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

pipeline.gte = function(key, val){
  return this.condition('gte', key, val);
}

/**
 * Append "greater than" condition to pipeline.
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

pipeline.gt = function(key, val){
  return this.condition('gt', key, val);
}

/**
 * Append "less than or equal to" condition to pipeline.
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

pipeline.lte = function(key, val){
  return this.condition('lte', key, val);
}

/**
 * Append "less than" condition to pipeline.
 *
 * @param {String}       key  The property to compare `val` to.
 * @param {Number|Date}  val
 * @api public
 */

pipeline.lt = function(key, val){
  return this.condition('lt', key, val);
}

/**
 * Tell adapter to insert `data` 
 * (or matching criteria) at this point.
 *
 * @api public
 */

pipeline.insert = function(data){
  return this.action('insert', data);
}

/**
 * Tell adapter to update `data` 
 * (or matching criteria) at this point.
 *
 * @api public
 */

pipeline.update = function(data){
  return this.action('update', data);
}

/**
 * Tell adapter to remove `data` 
 * (or matching criteria) at this point.
 *
 * @api public
 */

pipeline.remove = function(data){
  return this.action('remove', data);
}

/**
 * Tell adapter to query at this point.
 *
 * @api public
 */

pipeline.query = function(){
  return this.action('query');
}

/**
 * Tell adapter to pipe data into `fn` at this point.
 *
 * XXX: Not sure if this is an "action" 
 * or a different class of operations.
 *
 * @api public
 */

pipeline.pipe = function(fn){
  return this.action('pipe', fn);
}

/**
 * Sort ascending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the pipeline.
 *
 * @param {String} key
 * @api public
 */

pipeline.asc = function(key){
  return this.order(1, key);
}

/**
 * Sort descending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the pipeline.
 *
 * @param {String} key
 * @api public
 */

pipeline.desc = function(key){
  return this.order(-1, key);
}

/**
 * Pushes a `"relation"` onto the pipeline.
 *
 * @param {String} type
 * @param {String} key
 * @api private
 */

pipeline.relation = function(type, key){
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

pipeline.condition = function(op, key, val){
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

pipeline.action = function(type, data){
  return this.push('action', type, data);
}

/**
 * Pushes a sort direction onto the pipeline.

 * @param {Integer} dir   Direction it should point (-1, 1, 0).
 * @param {String}  key   The property to sort on.
 * @api private
 */

pipeline.order = function(dir, key){
  return this.push('order', dir, key);
}

/**
 * Push criterion onto pipeline.
 * 
 * @api private
 */

pipeline.push = function(){
  this.criteria.push(slice.call(arguments));
  return this;
}
