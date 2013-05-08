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

Select records:

```js
var query = require('tower-query');

query()
  .use('memory')
  .select('post')
  .where('likeCount').gte(10)
  .where('likeCount').lte(200)
  .all(function(err, posts){

  });
```

Create record(s):

```js
query()
  .use('memory')
  .select('post')
  .create({ title: 'Foo' }, function(err, post){

  });
```

Other actions `update` and `remove` work similarly.

The query delegates to adapters for these actions, which should return a `stream`-compatible API, such as a node.js `stream`, `tower-stream`, `tower-program`, or `tower-topology`. This is how `.find` looks at a lower level:

```js
query()
  .use('mongodb')
  .select('post')
  .action('find')
  .exec()
  .on('data', function(posts){

  })
  .on('end', function(){
    console.log('done querying');
  });
```

## License

MIT