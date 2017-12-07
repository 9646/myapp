var express = require('express');
var router = express.Router();
var config = require('../config');//引入配置文件
var wechat  = require('../wechat/wechat');
var wechatApp = new wechat(config);
/* GET users listing. */
router.get('/', function(req, res, next) {
    wechatApp.auth(req,res);
});

module.exports = router;
