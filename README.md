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

## License

MIT