/**
 * Created by cuebyte on 2014/6/14.
 */
var fs = require("fs");
var EventProxy = require("eventproxy");

var fileList = [];
var clearFileList = function() {
  fileList = [];
};
/**
 * 获得文件后缀名
 * @param path
 * @returns String
 */
var getSuffix = function(path) {
  var a = path.split(".");
  if(a.length = 0) return "";
  return a[a.length-1];
};
/**
 * 获得文件名（带后缀
 * @param path
 * @returns String
 */
var getFilename = function(path, suffix) {
  var a = path.split("/");
  if(a.length === 0) return "";
  return a[a.length-1].split("."+suffix)[0];
};

/**
 * 遍历问文件夹找到指定后缀名文件（广度遍历
 * @param path
 * @param suffix
 */
var walkFile = function(path, suffix) {
  var dirList = fs.readdirSync(path, "utf8");
  dirList.forEach(function(item) {
    if(fs.statSync(path + '/' + item).isFile() && getSuffix(item)!==suffix) {
      fileList.push(path + '/' + item);
    }
  });
  dirList.forEach(function(item) {
    if(fs.statSync(path + '/' + item).isDirectory()) {
      walkFile(path + '/' + item, suffix);
    }
  });
  return dirList;
};

/**
 * 加载某目录下的模板文件
 * @param path 模板存放目录
 * @param suffix 模板后缀名
 * @param callback 接受一个格式为{filename: data}的object
 */
var loadTemps = function(path, suffix, callback) {
  var proxy = new EventProxy();
  var tempMap = {};
  walkFile(path, suffix);
  var list = fileList;
  clearFileList();
  list.map(function(item) {
    fs.readFile(item, "utf8", function(err, data) {
      if(err) {
        return proxy.emit("error", err);
      }
      tempMap[getFilename(item, suffix)] = data;
      proxy.emit(item, null);
    });
  });
  proxy.fail(function(err) {
    callback(err, null);
  });
  proxy.all(list, function() {
    callback(null, tempMap);
  });
};

//console.log(t);
exports.loadTemps = loadTemps;