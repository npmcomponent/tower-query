var topology = require('..')
  , assert = require('assert');

describe('topology', function() {
  it('should chain', function() {
    var pipes = topology()
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
