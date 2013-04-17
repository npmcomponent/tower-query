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
      , ['condition', 'gte', 'likeCount', 10]
      , ['condition', 'lte', 'likeCount', 200]
    ];

    assert.deepEqual(expected, criteria);
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

          context.conditions.forEach(function(condition){
            // XXX: operators
            if (success) {
              switch (condition[1]) {
                case 'gte':
                  success = user[condition[2]] >= condition[3];
                  break;
                case 'lt':
                  success = user[condition[2]] < condition[3];
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
      .compile();

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
