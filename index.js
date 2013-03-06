
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

pipeline.incoming = function(key){
  return this.relation('incoming', key);
}

pipeline.outgoing = function(key){
  return this.relation('outgoing', key);
}

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

/**
 * @api private
 */

pipeline.relation = function(type, key){
  return this.push('relation', type, key);
}

/**
 * @param {String} op Operator string
 * @api private
 */

pipeline.condition = function(op, key, val){
  return this.push('condition', op, key, val);
}

/**
 * @api private
 */

pipeline.push = function(){
  this.criteria.push(slice.call(arguments));
  return this;
}
