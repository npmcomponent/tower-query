var query = require('..')
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

  it('should compile criteria to a topology', function(){
    var topology = query()
      .start('users')
      .gte('likeCount', 10)
      .lte('likeCount', 200)
      .compile();

    console.log(topology)
  });
});
