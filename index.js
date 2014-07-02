/**
 * Created by cuebyte on 2014/6/13.
 */

var Render = require("./lib/render")
  , rpc = require("./lib/rpc").rpc
  , tracer = require('tracer')
  , fs = require("fs");

var logger = tracer.console({
  level: 'log',
  transport: function(data) {
    console.log(data.output);
    fs.open('./log/templateServer.log', 'a', 0666, function(e, id) {
      if(e) console.log(e);
      fs.write(id, data.output+'\n', null, 'utf8', function() {
        fs.close(id, function(){});
      })
    })
  }
});
var render = new Render();

// 打开RPC服务
var rpcStart = function(err) {
  if(err) {
    logger.error(err);
    return;
  }
  rpc(render.render);
};

render.init('./test/test_data', 'jade', rpcStart);
