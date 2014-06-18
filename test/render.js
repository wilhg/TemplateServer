/**
 * Created by cuebyte on 2014/6/17.
 */
var Render = require("../lib/render.js").Render;
var should = require("should");
var data = {
  user: {
    name: "Big Brother",
    jojo: "II",
    pipi: "baka"
  }
};
var req1 = {
  func: "hello",
  data: data
};
var req2 = {
  func: "首页",
  data: data
};

describe('Render', function() {
  var render = new Render();
  describe('#init', function() {
    it('should init without error', function(done) {
      render.init("./test/test_data", "jade", done);
    })
  });
  // 不明白，这里为什么没有异步执行？难道describe之间是默认同步？
  describe('#render', function() {
    it('should get the some result', function() {
      render.render(req1).should.equal('<div class="welcomebox"><!-- Filtered inline output--><p>Welcome, Big Brother, Hello, baka</p></div>');
      render.render(req2).should.equal('<div class="welcomebox"><!-- Filtered inline output--><p>Welcome, Big Brother,Hello, baka,Byebye, II</p></div>');
    })
  });
});