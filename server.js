#!/usr/bin/env node

var express = require('express');
var app = express();
var path = require('path');
var WebSocketServer = require('websocket').server;
var WebSocketClient = require('websocket').client;
var WebSocketFrame = require('websocket').frame;
var WebSocketRouter = require('websocket').router;
var W3CWebSocket = require('websocket').w3cwebsocket;
var http = require('http');
var Redis = require('ioredis');
var redis = new Redis(6379, '192.168.100.10');
const sockets = {};

function sendMessages(userId, message) {
    sockets[userId].forEach(socket => {
        socket.send(JSON.stringify(message));
    });
}

redis.psubscribe('*', function(err, count) {});

redis.on('pmessage', function(subscrbed, channel, message) {
  // console.log(message);
    message = JSON.parse(message);
    console.log(channel);
    if (message.event === 'success'){
      sendMessages(message.QRkey, {
          user: message.id,
          event: 'LoginSuccess',
          message: "登录成功"
      });
    }
});

redis.on("error", function(err) {
    console.log(err);
});

// app.set("view engine", "ejs");
// app.use('/frontend', express.static(__dirname + '/frontend'));
//
// app.get('/login', function(req, res) {
//     res.render('login', {
//         key: req.query.id
//     });
// });

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    var user;

    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(messageString) {
        const message = JSON.parse(messageString.utf8Data);
        console.log('message', message);

        if (message.event === 'connect') {
            user = message.userId;
            sockets[user] = sockets[user] || [];
            sockets[user].push(connection);

            if (sockets[user].length > 1) {
                sendMessages(user, {
                    user: user,
                    event: 'fail',
                    message: "连接不成功"
                });
                sockets[user].pop();
            } else {
                sendMessages(user, {
                    user: user,
                    event: 'success',
                    message: "连接成功"
                });
            }
            console.log(sockets);
        } else if (message.event === 'email') {
            // console.log(message.email);
            var QRkey = message.QR;
            sendMessages(QRkey, {
                user: user,
                event: 'email',
                message: message.email
            });
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        delete sockets[user];
    });
});
