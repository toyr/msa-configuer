var express = require('express');
var zookeeper = require('node-zookeeper-client');
var httpProxy = require('http-proxy');

var PORT = 8080;
var CONNECTION_STRING = '192.168.199.215:2181';
var REGISTRY_ROOT = '/registry';

// 连接 ZooKeeper
var zk = zookeeper.createClient(CONNECTION_STRING);
zk.connect();

// 创建代理服务器对象并监听错误事件
var proxy = httpProxy.createProxyServer();
proxy.on('error', function (err, req, res) {
  res.end(); // 输出空白响应数据
});

// 启动 Web 服务器
var app = express();
app.all('*', function (req, res) {
  // 处理图标请求
  if (req.path === '/favicon.ico') {
    res.end();
    return;
  }
  // 获取服务名称
  var serviceName = req.get('Service-Name');
  console.log('serviceName: %s', serviceName);
  if (!serviceName) {
    console.log('Service-Name request header is not exist');
    res.end();
    return;
  }
  // 获取服务路径
  var servicePath = REGISTRY_ROOT + '/' + serviceName;
  console.log('servicePath: %s', servicePath);
  // 获取服务路径下的地址节点
  zk.getChildren(servicePath, function (error, addressNodes) {
    if (error) {
      console.log(error.stack);
      res.end();
      return;
    }
    var size = addressNodes.length;
    if (size === 0) {
      console.log('address node is not exist');
      res.end();
      return;
    }
    // 生成地址路径
    var serviceAddress;
    if (size === 1) {
      // 若只有一个地址，则获取该地址
      serviceAddress = addressNodes[0];
    } else {
      // 若存在多个地址，则随机获取一个地址
      serviceAddress = addressNodes[parseInt(Math.random() * size)]
    }
    console.log('serviceAddress: %s', serviceAddress);
    // 执行反向代理
    proxy.web(req, res, {
      target: 'http://' + serviceAddress // 目标地址
    });
  });
});
app.listen(PORT, function () {
  console.log('server is running at %d', PORT);
});
