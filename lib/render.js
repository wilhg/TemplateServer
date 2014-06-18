/**
 * Created by cuebyte on 2014/6/13.
 */
var jade = require("jade")
  , loadTemps = require("./temp_loader").loadTemps
  , Q = require("q")
  , tracer = require('tracer')
  , fs = require("fs");

var logger = tracer.console({
  level: 'log',
  transport: function(data) {
    console.log(data.output);
    fs.open('./log/templateServer.log', 'a', 0666, function(e, id) {
      if(e) console.log(e);
      fs.write(id, data.output+'\n', null, 'utf8', function() {
        fs.close(id, function(){})
      })
    })
  }
});
/**
 * 大家壕 Promise又来犯贱了
 */
var loadTempsPromise = function(path, suffix) {
  var deferred = Q.defer();
  loadTemps(path, suffix, function(err, list) {
    if(err) {
      deferred.reject(err);
    } else {
      deferred.resolve(list);
    }
  });
  return deferred.promise;
};

function Render() {
  var tempFuncions = {};
  var compileFuncions = function(temps) {
    for(key in temps) {
      tempFuncions[key] = jade.compile(temps[key]);
    }
  };
  /**
   * 初始化，编译模板
   * @param dir 模板目录
   * @param suffix 模板后缀（without dot）
   */
  this.init = function(dir, suffix, callback) {
    loadTempsPromise(dir, suffix)
      .then(compileFuncions)
      .then(function() {
        callback(null);
      }).fail(function(err) {
        callback(err);
      })
  };
  /**
   * 根据已编译好的函数渲染模板
   * @param req
   * @return html
   */
  this.render = function(req) {
    return tempFuncions[req.func](req.data);
  };
}

exports.Render = Render;