var pipeline = require('..')
  , assert = require('chai').assert;

describe('pipeline', function() {
  it('should chain', function() {
    var criteria = pipeline()
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
});
