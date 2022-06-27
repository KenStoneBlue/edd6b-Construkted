const express = require("express");
const logger = require('./logger');
const global = require('./global');
const http = require('./http');
const https = require('https');
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

exports.startHttp = function(){
    let server = app.listen(global.port);

    logger.log("server is listening on " + global.port);

    return server;
};

exports.start = function(){
    let options = {
        key: fs.readFileSync('privkey.pem'),
        cert: fs.readFileSync('fullchain.pem')
    };

    let server = https.createServer(options, app);
    server.listen(global.port);

    logger.log("server is listening on " + global.port);

    return server;
};

app.get('/', function(req, res){
    http.send(res, global.ERROR_SUCCESS, "edd_tiling_server is running!", {});
});

app.get('/request_tiling', function(req, res){
    const postId = req.query.postId;
    const slug = req.query.slug;
    const userName = req.query.userName;
    const fileName = req.query.fileName;
    const assetModelType = req.query.assetModelType;
    const attachmentId = req.query.attachmentId;

    if(!postId ) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "postId required!", {});
        return;
    }

    if(!slug) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "slug required!", {});
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

    if(!assetModelType ) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "assetModelType required!", {});
        return;
    }

    if(!attachmentId ) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "attachmentId required!", {});
        return;
    }

    // convert WP asset model type to source type of Cesium Ion API

    let sourceType = null;

    if(assetModelType === 'Polygon Mesh') {
        sourceType = '3D_CAPTURE';
    } else if(assetModelType === 'Point Cloud') {
        sourceType = 'POINT_CLOUD';
    } else if(assetModelType === '3D CAD Model') {
        sourceType = '3D_MODEL';
    }

    if(sourceType == null) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "failed to find sourceType of asset!", {});
        return;
    }

    const path = global.s3UploadLocation + '/' + userName + '/' + fileName;

    if (!fs.existsSync(path)) {
        http.send(res, global.ERROR_INVALID_PARAMETER, path + " does not exist!", {});
        return;
    }

    const data = {
        postId: postId,
        slug: slug,
        userName: userName,
        fileName: fileName,
        sourceType: sourceType,
        attachmentId: attachmentId
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

app.get('/delete_asset', function(req, res){
    const userName = req.query.userName;
    const slug = req.query.slug;
    const original3DFileBaseName = req.query.original3DFileBaseName;

    if(!userName ) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "userName required!", {});
        return;
    }

    if(!slug) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "slug required!", {});
        return;
    }

    if(!original3DFileBaseName ) {
        http.send(res, global.ERROR_INVALID_PARAMETER, "original3DFileBaseName required!", {});
        return;
    }

    let data = {
        isSuccessfulDeleteUploadedFile: false,
        isSuccessfulDelete3DTile: false,
    };

    const uploadedFilePath = global.s3UploadLocation + '/' + userName + '/' + slug + '-' + original3DFileBaseName;

    if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
        data.isSuccessfulDeleteUploadedFile = true;
    }

    const assetPath = global.s3AssetLocation + '/' + slug + '.3dtiles';

    if(fs.existsSync(assetPath)) {
        fs.unlinkSync(assetPath);
        data.isSuccessfulDelete3DTile = true;
    }

    if(!data.isSuccessfulDeleteUploadedFile && !data.isSuccessfulDelete3DTile){
        http.send(res, global.ERROR_INVALID_PARAMETER, "asset does not exist!", data);
        return;
    }

    http.send(res, global.ERROR_SUCCESS, "", data);
});



