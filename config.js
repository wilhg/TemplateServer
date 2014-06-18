/**
 * 使用RabbitMQ的Topic模式
 * 以下是配置
 */

// 通用配置
var URL = "amqp://node:node@10.232.0.202/" + "/";

var exchange1 = "topic_test";
exports.topic_emit1 = {
  connection: URL,
  routingKey: "danmaku.test",
  exchange: exchange1,
  exchangeOption: {durable: true}
};

exports.topic_emit2 = {
  connection: URL,
  routingKey: "ban.test",
  exchange: exchange1,
  exchangeOption: {durable: true}
};

exports.topic_receive = {
  connection: URL,
  routingKey: ["*.test"],
  exchange: exchange1,
  exchangeOption: {durable: true},
  queue: "rec",
  queueOption: {exclusive: true},
  consumeOption: {noAck: false}
};