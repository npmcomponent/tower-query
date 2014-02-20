
/**
 * Module dependencies.
 */

// commented out by npm-component: var program = require('tower-program');

/**
 * Expose `query-subscriber` program.
 */

module.exports = subscriber();

/**
 * Define a query subscribing program.
 *
 * @return {Program} A query subscriber program.
 */

function subscriber() {
  program('query-subscriber')
    .input('create')
    .input('update')
    .input('remove');

  return program('query-subscriber').init();
}