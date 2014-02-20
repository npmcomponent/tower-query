*This repository is a mirror of the [component](http://component.io) module [tower/query](http://github.com/tower/query). It has been modified to work with NPM+Browserify. You can install it using the command `npm install npmcomponent/tower-query`. Please do not open issues or send pull requests against this repo. If you have issues with this repo, report it to [npmcomponent](https://github.com/airportyh/npmcomponent).*
# Tower Query API

Query anything, anywhere.

## Installation

node.js:

```bash
$ npm install tower-query
```

browser:

```bash
$ component install tower/query
```

## Examples

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