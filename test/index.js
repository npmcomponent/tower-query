var query = require('..')
  , stream = require('tower-stream')
  , adapter = require('tower-adapter')
  , assert = require('assert');

describe('query', function(){
  it('should chain', function(){
    var criteria = query()
      .start('user')
      .where('likeCount')
        .gte(10)
        .lte(200)
      .criteria;

    var expected = [
        [ 'start', { model: 'user' } ]
      , [ 'constraint', {
            left: { adapter: 'memory', model: 'user', attr: 'likeCount' }
          , operator: 'gte'
          , right: { value: 10, type: 'number' } } ]
      , [ 'constraint', {
            left: { adapter: 'memory', model: 'user', attr: 'likeCount' }
          , operator: 'lte'
          , right: { value: 200, type: 'number' } } ]
    ];

    assert.deepEqual(expected, criteria);
  });

  it('should find minimum-cost maximum-flow', function(){
    var topology = query()
      // mapped(user) -> reduced(user)
      .select('user')
      .select('facebook.user')
      .select('twitter.user')
      // random constraints purely on the models
      .where('user.likeCount').gte(10)
      .where('facebook.likeCount').gte(20)
      // constraints between models
      // .on('exec', function(context) { context.tests[user.id] = context.constraints.length })
      // if (context.tests[user.id] === 0)
      //    it passed all the constraints! it's been reduced!
      //
      // mapped(facebook.user) -> reduced(facebook.user)
      // reduced(facebook.user) -> reduced(user)
      // fetch facebook.user first, and use those records against `user`.
      .where('user.email', 'facebook.user.email')
      // twitter.user -> reduced(facebook.user)
      .where('facebook.user.username', 'twitter.user.username')
      // twitter.user -> reduced(user)
      .where('user.firstName', 'twitter.user.firstName')
      .returns('user')
      .topology();

    // 6: [user, facebook.user, twitter.user, constraints(user), constriants(facebook.user)]
    // assert(6 === topology.size())

    // only query `users` who have a `facebook.user.email`

    // only query `twitter.user` who's firstName is the same as a `user`
    // same as the reverse.
    // only query `user` who's firstName is the same as a `twitter.user`

    // labelled edges would allow same "edge" between node
    // to be evaluated separately (multigraph?).
    // twitter -> user == "twitter-first"
    // user -> twitter == "user-first"
    // there is then a cost associated with doing one first over the other,
    // based on our knowledge of how many http requests vs. db requests
    // it'd have to make to get the result.

    // I am pretty sure this is a "circulation" problem, not 100% though.
    // http://en.wikipedia.org/wiki/Directed_acyclic_graph

    // build a dependency graph, must be acyclic
  });

  it('should find minimum-cost maximum-flow in an easier way (graph api)', function(){
    //var topology = query()
    //  .start('user')
    //  .incoming('facebook.user')
    //  .topology();
  });

  it('should execute adapter', function(done){
    adapter('example')
      .model('user')
        .action('find');

    adapter('example').execute = function(criteria, fn){
      assert(1 === criteria.length);
      fn();
    }

    var topology = query()
      .use('example')
      .select('user')
      .exec(function(){
        done();
      });
  });

  it('should compile criteria to a topology', function(done){
    var users = [
        { name: 'first', likeCount: 20 }
      , { name: 'second', likeCount: 10 }
      , { name: 'third', likeCount: 8 }
      , { name: 'fourth', likeCount: 300 }
    ];

    stream('user.find')
      .on('exec', function(context, data, fn){
        var matches = [];

        users.forEach(function(user){
          var success = true;

          context.constraints.forEach(function(constraint){
            // XXX: operators
            if (success) {
              switch (constraint[2]) {
                case 'gte':
                  success = user[constraint[1].attr] >= constraint[3];
                  break;
                case 'lt':
                  success = user[constraint[1].attr] < constraint[3];
                  break;
              }
            }
            
            if (!success) return false;
          });

          if (!success) return false;

          matches.push(user);
        });

        context.emit('data', matches);
        context.close();
      });

    var topology = query()
      .start('user')
      .where('likeCount')
        .gte(10)
        .lt(20)
      .topology();

    var result;

    topology
      .on('data', function(data){
        result = data;
      })
      .on('close', function(){
        assert(1 === result.length);
        assert('second' === result[0].name)
        done();
      })
      .exec();
  });

  it('should save named queries', function(){
    var named = query('foo')
      .where('x', 1);

    assert(named === query('foo'));
  });
});
