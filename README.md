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

var usersQuery = query()
  .start('users')
  .where('likeCount').gte(10)
  .where('likeCount').lte(200);

assert.deepEqual([
    ['start', 'users']
  , ['constraint', 'likeCount', 'gte', 10]
  , ['constraint', 'likeCount', 'lte', 200]
], usersQuery.criteria);

console.log(usersQuery.topology());
```

## Notes

The shortest path between two entities in a dependency graph offers a very condensed representation
of the information needed to assess their relationship.

- http://www.cs.utexas.edu/~ml/papers/spk-emnlp-05.pdf
- http://stackoverflow.com/questions/1482619/shortest-path-for-a-dag
- http://www.columbia.edu/~cs2035/courses/ieor6614.S09/sp.pdf
- http://www.stoimen.com/blog/2012/10/28/computer-algorithms-shortest-path-in-a-directed-acyclic-graph/
- http://stackoverflow.com/questions/905379/what-is-the-difference-between-join-and-union
- http://blog.sqlauthority.com/2008/08/03/sql-server-2005-difference-between-intersect-and-inner-join-intersect-vs-inner-join/
- http://www.codinghorror.com/blog/2007/10/a-visual-explanation-of-sql-joins.html
- http://www.cs.indiana.edu/~vgucht/ImplementationGQL.pdf
- https://wiki.engr.illinois.edu/download/attachments/186384416/gql_camera.pdf?version=1&modificationDate=1256250869000
- [G-SPARQL: A Hybrid Engine for Querying Large Attributed Graphs](http://research.microsoft.com/pubs/157417/GSPARQL.pdf)
- [Query Languages for Graph Databases](http://users.dcc.uchile.cl/~pbarcelo/wood.pdf)
- http://www.cs.wayne.edu/~shiyong/papers/scc11a.pdf
- http://en.wikipedia.org/wiki/SQL

### Queries

- http://blog.neo4j.org/2013/01/demining-join-bomb-with-graph-queries.html
- http://stackoverflow.com/questions/13792601/how-to-change-complex-cypher-queries-to-simple-query-in-neo4j

## License

MIT