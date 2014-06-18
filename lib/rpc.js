var amqp = require('amqplib')
  , config = require('../config')
  , option = config.topic_receive
  , all = require("when").all
  , tracer = require('tracer')
  , fs = require("fs");

var logger = tracer.console({
  level: 'log',
  transport: function(data) {
    fs.open('./log/templateServer.log', 'a', 0666, function(e, id) {
      if(e) console.log(e);
      console.log("opened");
      fs.write(id, data.output+'\n', null, 'utf8', function() {
        fs.close(id, function(){})
      })
    })
  }
});

/**
 * 打开基于RabbitMQ的RPC服务，并基于此提供模板渲染服务
 * @param renderFunc 从外部传入的渲染方法
 */
var rpc = function(renderFunc) {
  amqp.connect(option.connection).then(function (conn) {
    process.once('SIGINT', function () {
      conn.close();
    });
    return conn.createChannel().then(function (ch) {
      var ok = ch.assertExchange(option.exchange, 'topic', option.exchangeOption);
      ok = ok.then(function () {
        return ch.assertQueue(option.queue, option.queueOption);
      });

      // bind routing keys to queue
      ok = ok.then(function (qok) {
        var queue = qok.queue;
        return all(option.routingKey.map(function (rk) {
          ch.bindQueue(queue, option.exchange, rk);
        })).then(function () {
          return queue;
        });
      });
      ok = ok.then(function (queue) {
        return ch.consume(queue, reply, option.consumeOption);
      });

      return ok.then(function () {
        logger.log('RPC Started');
        console.log('Awaiting RPC requests');
      });

      function reply(msg) {
        try {
          var req = JSON.parse(msg.content.toString());
        } catch (e) {
          logger.err(e);
        }
        var response = renderFunc(req);
        ch.sendToQueue(msg.properties.replyTo,
          new Buffer(response),
          {correlationId: msg.properties.correlationId});
        ch.ack(msg);
      }
    });
  }).then(null, console.warn);
};
exports.rpc = rpc;