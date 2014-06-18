/**
 * Created by cuebyte on 2014/6/17.
 */
var loadTemps = require("../lib/temp_loader").loadTemps;

describe("Loader Template", function() {
  describe("#loadTemps", function() {
    it('should without error', function(done) {
      loadTemps("./test/test_data", "jade", function(err, data) {
        if(err) throw err;
        done();
      });
    });

    it('should correct with its filename', function() {
      loadTemps("./test/test_data", "jade", function(err, data) {
        var filenames = ['首页', 'hello'];
        for(key in data) {
          filenames.findIndex(function(elem) {
            return key === elem;
          }).should.not.equal(-1);
        }
      });
    });
  })
});