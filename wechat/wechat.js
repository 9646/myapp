'use strict'
const crypto =  require('crypto'), //引入加密模块
      https = require('https'),   //引入 htts 模块
      fs = require('fs'),        //引入fs模块
      util = require('util'),   //引入工具包
      urltil = require('url'), //引入url模块
      accessTokenJson  = require('./access_token');

var WeChat = function(config) {
    // 设置WeChat对象属性config
    this.config = config;
    // 设置WeChat对象属性token
    this.token = config.token;
    // 设置WeChat对象属性appID
    this.appID = config.appID;
    // 设置WeChat对象属性appScrect
    this.appScrect = config.appScrect;
    // 设置WeChat对象属性apiDomain
    this.apiDomain = config.apiDomain;
    // 设置WeChat对象属性apiURL
    this.apiURL = config.apiURL;

    // 处理https Get 请求
    this.requireGet = function(url) {
        return new Promise(function(resolve, reject) {
            https.get(url, function(res) {
                var buffer = [], result="";
                // 监听data事件
                res.on('data', function(data){
                    buffer.push(data);
                });
                res.on('end', function() {
                    result = Buffer.concat(buffer).toString('utf-8');
                    //将最后结果返回
                    console.log(result);
                    resolve(result);
                });
            }).on('error', function(err) {
                reject(err);
            })
        })
    }

    // 处理https post 请求
    this.requirePost = function(url,data) {
        return new Promise(function(resolve, reject) {
            // 解析url
            var urlData = urltil.parse(url);
            console.log('解析url');
            console.log(url);
            console.log(urlData);
            // 设置https请求参数对象
            var options = {
                // 地址
                hostname: urlData.hostname,
                // 目标
                path: urlData.path,
                // 请求方式
                method: 'POST',
                // 头部协议
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data,'utf-8')
                }
            }

            var req = https.request(options, function(res) {
                var buffer = [], result = '';
                // 监听data事件
                res.on('data', function(data) {
                    buffer.push(data);
                });
                res.on('end', function() {
                    result = Buffer.concat(buffer).toString('urf-8');
                    resolve(result);
                });
            })
            .on('error', function(err) {
                reject(err);
            });
            req.write(data);
            req.end();
        })
    }
}

// 验证是否连接成功
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

// 获取access_token
WeChat.prototype.getAccessToken = function() {
    var that = this;
    return new Promise(function(resolve, reject) {
        // 获取时间戳
        var currentTime =  new Date().getTime();
        var url = util.format(that.apiURL.accessTokenApi, that.apiDomain, that.appID, that.appScrect);
        if(accessTokenJson.access_token === '' || accessTokenJson.expires_time < currentTime) {
            that.requireGet(url).then(function(data) {
                var result = JSON.parse(data);
                if(data.indexOf("errcode") < 0) {
                    accessTokenJson.access_token = result.access_token;
                    accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                    fs.writeFile('./wechat/access_token.json', JSON.stringify(accessTokenJson));
                    // 获取并返回
                    resolve(accessTokenJson.access_token);
                }else{
                    //将错误返回
                    resolve(result);
                }
            })
        } else {
            resolve(accessTokenJson.access_token);
        }
    })

    // 
}

module.exports = WeChat;