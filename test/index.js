var pipeline = require('..')
  , assert = require('assert');

describe('pipeline', function() {
  it('should chain', function() {
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
  });
});
