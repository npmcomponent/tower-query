var query = require('..')
  , stream = require('tower-stream')
  , assert = require('assert');

describe('query', function(){
  it('should chain', function(){
    var criteria = query()
      .start('users')
      .gte('likeCount', 10)
      .lte('likeCount', 200)
      .criteria;

    var expected = [
        ['start', 'users']
      , ['constraint', 'likeCount', 'gte', 10]
      , ['constraint', 'likeCount', 'lte', 200]
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
      .gte('user.likeCount', 10)
      .gte('facebook.likeCount', 20)
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

  it('should compile criteria to a topology', function(done){
    var users = [
        { name: 'first', likeCount: 20 }
      , { name: 'second', likeCount: 10 }
      , { name: 'third', likeCount: 8 }
      , { name: 'fourth', likeCount: 300 }
    ];

    stream('users.find')
      .on('execute', function(context, data, fn){
        var matches = [];

        users.forEach(function(user){
          var success = true;

          context.constraints.forEach(function(constraint){
            // XXX: operators
            if (success) {
              switch (constraint[2]) {
                case 'gte':
                  success = user[constraint[1]] >= constraint[3];
                  break;
                case 'lt':
                  success = user[constraint[1]] < constraint[3];
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
      .start('users')
      .gte('likeCount', 10)
      .lt('likeCount', 20)
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
      .execute();
  });
});
