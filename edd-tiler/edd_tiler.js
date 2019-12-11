const express = require("express");
const logger = require('./logger');
const global = require('./global');
const http = require('./http');
const tiler = require('./tiler');
const fs = require('fs');

const app = express();

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

let tilingJobInfos = [];

exports.start = function(){
    let server = app.listen(global.port);

    logger.log("server is listening on " + global.port);

    return server;
};

app.get('/', function(req, res){
    http.send(res, global.ERROR_SUCCESS, "edd_tiling_server is running!", {});
});

app.get('/request_tiling', function(req, res){
    const postId = req.query.postId;
    const userName = req.query.userName;
    const fileName = req.query.fileName;


    if(!postId ) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "postId required!", {});
        return;
    }

    if(!userName ) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "userName required!", {});
        return;
    }

    if(!fileName ) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "fileName required!", {});
        return;
    }

    const path = global.s3UploadLocation + '/' + userName + '/' + fileName;

    if (!fs.existsSync(path)) {
        http.send(res, global.ERROR_INVALID_PARAMETER, path + " does not exist!", {});
        return;
    }

    const data = {
        postId: postId,
        userName: userName,
        fileName: fileName
    };

    tilingJobInfos.push(data);

    startTiling(data);

    const ret = {
    };

    http.send(res, global.ERROR_SUCCESS, "tiling started", ret);
});

function startTiling(data) {
    data.state = global.State.Unknown;

    tiler.startTiling(data);
}

app.get('/get_active', function(req, res){
    http.send(res, global.ERROR_SUCCESS, "", tilingJobInfos);
});

