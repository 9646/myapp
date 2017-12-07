var express = require('express');
var router = express.Router();
var config = require('../config');//引入配置文件
var wechat  = require('./wechat');
var wechatApp = new wechat(config);
/* GET users listing. */
router.get('/', function(req, res, next) {
    wechatApp.auth(req,res);
});

router.get('/getAccessToken', function (req, res) {
    wechatApp.getAccessToken().then(function(data){
        res.send(data);
    });  
});

module.exports = router;
