var query = require('..')
  , adapter = require('tower-adapter')
  , assert = require('assert');

describe('query', function(){
  describe('limit', function(){
    before(function(){
      adapter('test-limit').exec = function(q, fn){
        q.called = true;
        fn();
      }
    });

    it('should limit', function(done){
      query()
        .use('test-limit')
        .all(function(){
          done();
        });
    });
  });
});