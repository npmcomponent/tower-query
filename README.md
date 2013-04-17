# Tower Query API

## Installation

node:

```
npm install tower-query
```

browser:

```
component install tower/query
```

## Example

```js
var query = require('tower-query');

var criteria = query()
  .start('users')
  .where('likeCount').gte(10)
  .where('likeCount').lte(200)
  .criteria;

var expected = [
    ['start', 'users']
  , ['constraint', 'likeCount', 'gte', 10]
  , ['constraint', 'likeCount', 'lte', 200]
];

assert.deepEqual(expected, criteria);
```

## Notes

The shortest path between two entities in a dependency graph offers a very condensed representation
of the information needed to assess their relationship.

- http://www.cs.utexas.edu/~ml/papers/spk-emnlp-05.pdf
- http://stackoverflow.com/questions/1482619/shortest-path-for-a-dag
- http://www.columbia.edu/~cs2035/courses/ieor6614.S09/sp.pdf
- http://www.stoimen.com/blog/2012/10/28/computer-algorithms-shortest-path-in-a-directed-acyclic-graph/

## License

MIT