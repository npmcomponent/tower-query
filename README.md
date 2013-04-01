# Tower Pipeline

## Installation

node:

```
npm install tower-pipeline
```

browser:

```
component install tower/pipeline
```

## Example

This is a `tower-pipeline` mixin.

``` javascript
var pipeline = require('tower-pipeline');

var pipes = pipeline()
  .start('users')
  .gte('likeCount', 10)
  .lte('likeCount', 200)
  .pipes;

var expected = [
    ['start', 'users']
  , ['condition', 'gte', 'likeCount', 10]
  , ['condition', 'lte', 'likeCount', 200]
];

assert.deepEqual(expected, pipes);
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