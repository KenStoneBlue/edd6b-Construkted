var http = require('http');
var https = require('https');
var qs = require('querystring');
var logger = require('./logger');


/**
 *
 * @param host
 * @param port
 * @param path
 * @param data
 * @param callback(success, res/error)  respond callback
 *        success {boolean}
 *        res/error if success is true, second argument is responding json string
 *                  if success is false, second argument is error event.
 *
 * @param safe
 */

exports.get = function (host, port, path, data, callback, safe) {
    var content = qs.stringify(data);

    var options = {
        hostname: host,
        path: path + '?' + content,
        method:'GET'
    };

    if(port){
        options.port = port;
    }

    var proto = http;

    if(safe){
        proto = https;
    }

    var req = proto.request(options, function(res) {
        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            try {
                var json = JSON.parse(chunk);

                callback(true, json);
            }
            catch (e) {
                logger.error("error occurs while following json string: " + chunk, "exception");
                logger.error(e.stack, "exception");

                callback(false, e);
            }
        });
    });

    req.on('error', function (e) {
        callback(false, e);
    });

    req.end();
};

exports.get2 = function (url, data, callback, safe) {
    var content = qs.stringify(data);
    var url = url + '?' + content;
    var proto = http;

    if(safe){
        proto = https;
    }

    var req = proto.get(url, function (res) {
        logger.log('STATUS: ' + res.statusCode);
        logger.log('HEADERS: ' + JSON.stringify(res.headers));

        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            var json = JSON.parse(chunk);

            callback(true, json);
        });
    });

    req.on('error', function (e) {
        logger.log('problem with request: ' + e.message);

        callback(false, e);
    });

    req.end();
};

/**
 *
 * send Http respond
 * @param res
 * @param errCode
 * @param errMsg
 * @param data
 */
exports.send = function(res, errCode, errMsg, data){
    if(data == null){
        data = {};
    }

    data.errCode = errCode;
    data.errMsg = errMsg;

    var jsonString = JSON.stringify(data);

    res.send(jsonString);
};

