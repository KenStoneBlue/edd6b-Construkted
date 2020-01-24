const assert = require("assert");
const global = require('./global');
const AWS = require('aws-sdk');
const fs = require('fs');
const request = require('request-promise');
const path = require('path');
const logger = require('./logger');
const http = require('./http');

async function createAsset(data) {
    const userName = data.userName;
    const fileName = data.fileName;
    const sourceType = data.sourceType;

    const accessToken = global.accessToken;
    const name = userName + '_' + '_' + fileName;
    const description = userName + '_' + '_' + fileName;

    const input = global.s3UploadLocation + '/' + userName + '/' + fileName;

    data.state = global.State.Creating;

    const response = await request({
        url: 'https://api.cesium.com/v1/assets',
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        json: true,
        body: {
            name: name,
            description: description,
            type: '3DTILES',
            options: {
                sourceType: sourceType,
                clampToTerrain: true,
                baseTerrainId: undefined
            }
        }
    });

    const assetId = response.assetMetadata.id;

    // Step 2 Use response.uploadLocation to upload the file to ion
    logger.log('Asset ' + assetId + ' created. Uploading ' + input);

    data.assetId = assetId;

    const uploadLocation = response.uploadLocation;

    data.state = global.State.Uploading;

    data.uploadingProgress = 0;

    const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        region: 'us-east-1',
        signatureVersion: 'v4',
        endpoint: uploadLocation.endpoint,
        credentials: new AWS.Credentials(
            uploadLocation.accessKey,
            uploadLocation.secretAccessKey,
            uploadLocation.sessionToken)
    });

    const baseName =  path.basename(input);

    await s3.upload({
        Body: fs.createReadStream(input),
        Bucket: uploadLocation.bucket,
        Key: `${uploadLocation.prefix}${baseName}`
    }).on('httpUploadProgress', function (progress) {
        logger.log(`Upload: ${((progress.loaded / progress.total) * 100).toFixed(2)}%`);

        data.uploadingProgress = ((progress.loaded / progress.total) * 100).toFixed(2);

    }).promise();

    // Step 3 Tell ion we are done uploading files.
    const onComplete = response.onComplete;

    await request({
        url: onComplete.url,
        method: onComplete.method,
        headers: { Authorization: `Bearer ${accessToken}` },
        json: true,
        body: onComplete.fields
    });

    // Step 4 Monitor the tiling process and report when it is finished.

    data.state = global.State.Tiling;

    async function waitUntilReady() {
        const assetId = response.assetMetadata.id;

        // Issue a GET request for the metadata
        const assetMetadata = await request({
            url: `https://api.cesium.com/v1/assets/${assetId}`,
            headers: { Authorization: `Bearer ${accessToken}` },
            json: true
        });

        const status = assetMetadata.status;

        if (status === 'COMPLETE') {
            logger.log('Asset tiled successfully');
            logger.log(`View in ion: https://cesium.com/ion/assets/${assetMetadata.id}`);

            data.tilingStatus = 'COMPLETE';

            download(data);

        } else if (status === 'DATA_ERROR') {
            logger.log('ion detected a problem with the uploaded data.');
            data.tilingStatus = 'DATA_ERROR';

        } else if (status === 'ERROR') {
            logger.log('An unknown tiling error occurred, please contact support@cesium.com.');

            data.tilingStatus = 'ERROR';
        } else {
            if (status === 'NOT_STARTED') {
                logger.log('Tiling pipeline initializing.');

                data.tilingStatus = 'NOT_STARTED';
            } else { // IN_PROGRESS
                logger.log(`Asset is ${assetMetadata.percentComplete}% complete.`);

                data.tilingStatus = assetMetadata.percentComplete;
            }

            // Not done yet, check again in 10 seconds
            setTimeout(waitUntilReady, 10000);
        }
    }

    waitUntilReady(data);
}

async function download(data) {
    data.state = global.State.Downloading;

    const assetId = data.assetId;

    logger.log('start downloading ' + 'Asset : ' + assetId);

    const spawn = require('child_process').spawn;

    const child = spawn(global.python, [global.downloader, global.downloaderThreadCount, assetId, global.accessToken]);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('error', function(err) {
        logger.log('error in downloading ' + 'Asset : ' + assetId);
        process.exit(1);
    });

    child.on('exit', function(code) {
        if(code !== 0) {
            logger.log('error in downloading ' + 'Asset : ' + assetId);
        }
        else {
            packaging(data);
        }
    });
}

var removeDir = function(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return;
    }

    var list = fs.readdirSync(dirPath);

    for (var i = 0; i < list.length; i++) {
        var filename = path.join(dirPath, list[i]);
        var stat = fs.statSync(filename);

        if (filename == "." || filename == "..") {
            // do nothing for current and parent dir
        } else if (stat.isDirectory()) {
            removeDir(filename);
        } else {
            fs.unlinkSync(filename);
        }
    }

    fs.rmdirSync(dirPath);
};

async function packaging(data) {
    data.state = global.State.Packaging;

    const assetId = data.assetId;
    const slug = data.slug;

    logger.log('Start packaging ' + 'Asset : ' + assetId);

    const spawn = require('child_process').spawn;

    const downloadedTilesetFolder = './' + assetId;
    const outputFilePath = global.s3AssetLocation + '/' + slug + '.3dtiles';

    const child = spawn(global.node, [global.tilesToolsPath, 'tilesetToDatabase', downloadedTilesetFolder, outputFilePath]);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('error', function(err) {
        logger.log('error in packaging ' + 'Asset : ' + assetId);

        process.exit(1);
    });

    child.on('exit', async function(code) {
        if(code !== 0) {
            logger.log('error in packaging ' + 'Asset : ' + assetId);
        }
        else {
            logger.log('removing ' + __dirname + '/' + assetId);
            data.state = global.State.Deleting;

            removeDir(__dirname + '/' + assetId);

            logger.log('deleting asset : ' + assetId + ' from Ion');

            const response1 = await request({
                url: 'https://api.cesium.com/v1/assets/' + assetId,
                method: 'DELETE',
                headers: { Authorization: `Bearer ${global.accessToken}` },
                json: true,
            });

            logger.log('preparation of asset ' + assetId + ' finished');

            data.state = global.State.Finished;

            http.get(global.WPServerIp, undefined, global.WPUpdateProductRESTAPI_EndPoint, {post_id: data.postId, attachment_id: data.attachmentId}, function (success, data) {
                if(success === false){
                    logger.log('failed to connect to WP REST API');
                    return;
                }

                if(data.errCode === 0)
                {
                    logger.log(data.errMsg);
                }
                else {
                    logger.error(data.errMsg);
                }
            });
        }
    });
}

//createAsset();

exports.startTiling = function (data) {
    createAsset(data);
};
