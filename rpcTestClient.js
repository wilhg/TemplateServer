var amqp = require('amqplib');
var basename = require('path').basename;
var when = require('when');
//var defer = when.defer;
var uuid = require('node-uuid');
var option = require('./config').topic_emit1;

///////// TEST DATA ////////
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
///////// END /////////////

// I've departed from the form of the original RPC tutorial, which
// needlessly introduces a class definition, and doesn't even
// parameterise the request.
//
var n;
try {
  if (process.argv.length < 3) throw Error('Too few args');
  n = parseInt(process.argv[2]);
}
catch (e) {
  console.error(e);
  console.warn('Usage: %s number', basename(process.argv[1]));
  process.exit(1);
}

amqp.connect('amqp://node:node@10.232.0.202//').then(function(conn) {
  return when(conn.createChannel().then(function(ch) {
    //var answer = defer();
    var corrId = uuid();
    function maybeAnswer(msg) {
      if (msg.properties.correlationId === corrId) {
        //answer.resolve(msg.content.toString());
        console.log(msg.content.toString());
      }
    }
    var ok = ch.assertExchange(option.exchange, 'topic', option.exchangeOption);
//    ok = ok.then(function () {
//      return ch.assertQueue(option.queue, option.queueOption);
//    });
    ok = ch.assertQueue('', {exclusive: true})
      .then(function(qok) { return qok.queue; });

    ok = ok.then(function(queue) {
      return ch.consume(queue, maybeAnswer, {noAck: true})
        .then(function() { return queue; });
    });
    // 都准备好了以后开始发
    ok = ok.then(function(queue) {
      console.log(' [x] Requesting fib(%d)', n);
      for(var i=0; i<n; i++) {
        ch.publish(option.exchange, option.routingKey, new Buffer(JSON.stringify(req1)), {
          correlationId: corrId, replyTo: queue
        });
      }
      //return answer.promise;
    });

//    ok.then(function(fibN) {
//      console.log(' [.] Got', fibN);
//    });
  }));//.ensure(function() { conn.close(); });
}).then(null, console.warn);