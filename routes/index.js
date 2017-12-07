var express = require('express');
var router = express.Router();
var wechat  = require('../wechat/wechat');
var config = require('../config');//引入配置文件
var token = 'myapp';
var wechatApp = new wechat(config);

router.get('/', function(req, res, next) {
  wechatApp.auth(req,res);
});

module.exports = router;
