var query = require('..')
  , assert = require('assert');

describe('query', function() {
  it('should chain', function() {
    var pipes = query()
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
  });
});
