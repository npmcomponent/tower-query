
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

pipeline.gte = function(key, val){
  return this.condition('gte', key, val);
}

pipeline.gt = function(key, val){
  return this.condition('gt', key, val);
}

pipeline.lte = function(key, val){
  return this.condition('lte', key, val);
}

pipeline.lt = function(key, val){
  return this.condition('lt', key, val);
}

pipeline.insert = function(data){
  return this.action('insert', data);
}

pipeline.update = function(data){
  return this.action('update', data);
}

pipeline.remove = function(data){
  return this.action('remove', data);
}

/**
 * Pushes a `"relation"` into the pipeline.
 *
 * @param {String} type
 * @param {String} key
 * @api private
 */

pipeline.relation = function(type, key){
  return this.push('relation', type, key);
}

/**
 * Pushes a `"condition"` into the pipeline.
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
 * Pushes an `"action"` into the pipeline.
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
 * 
 */

/**
 * @api private
 */

pipeline.push = function(){
  this.criteria.push(slice.call(arguments));
  return this;
}
