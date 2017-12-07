'use strict'
const crypto =  require('crypto'); //引入加密模块

var WeChat = function(config) {
    // 设置WeChat对象属性
    this.config = config;
    this.token = config.token;
}

WeChat.prototype.auth = function(req,res) {
    // 获取微信服务器请求的参数         
    var signature = req.query.signature;//微信加密签名
    var timestamp = req.query.timestamp;//时间戳
    var nonce = req.query.nonce;//随机数
    var echostr = req.query.echostr;//随机字符串
    
    //将token、timestamp、nonce三个参数进行字典序排序
    var array = new Array(this.token, timestamp, nonce);
    array.sort();
    var str = array.toString().replace(/,/g, '');


    var sha1Code = crypto.createHash('sha1');
    var code = sha1Code.update(str, 'utf-8').digest('hex');

    if(code===signature) {
    res.send(echostr);
    } else {
    res.send('mismatch');
    }
}


module.exports = WeChat;