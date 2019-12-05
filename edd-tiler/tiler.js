const assert = require("assert");
const global = require('./global');
const AWS = require('aws-sdk');
const fs = require('fs');
const request = require('request-promise');
const yargs = require('yargs');
const path = require('path');
const logger = require('./logger');

const argv = yargs.argv;

const jsonPath = argv.jsonPath;

if(!jsonPath) {
    logger.error('jsonPath is empty!');
    return;
}

let data = global.readJsonFile(jsonPath);

assert(data.state === global.State.Unknown);

fs.unlinkSync(jsonPath);

async function createAsset() {
    const accessToken = global.accessToken;
    const name = data.name;
    const description = data.description;
    const sourceType = data.sourceType;
    const input = data.input;

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

    // Step 2 Use response.uploadLocation to upload the file to ion
    logger.log('Asset created. Uploading ' + input);

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

            download(assetMetadata.id);

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

    waitUntilReady();
}

async function download(assetId) {
    const spawn = require('child_process').spawn;

    const child = spawn(global.python, [global.downloader, global.downloaderThreadCount, assetId, global.accessToken]);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('error', function(err) {
        process.exit(1);
    });

    child.on('exit', function(code) {
        if(code !== 0) {

        }
        else {
            packaging(assetId);
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

async function packaging(assetId) {
    const spawn = require('child_process').spawn;

    const downloadedTilesetFolder = './' + assetId;
    const outputFilePath = global.s3Location + '/' + assetId + '.3dtiles';

    const child = spawn(global.node, [global.tilesToolsPath, 'tilesetToDatabase', downloadedTilesetFolder, outputFilePath]);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('error', function(err) {
        process.exit(1);
    });

    child.on('exit', async function(code) {
        if(code !== 0) {

        }
        else {
            removeDir(__dirname + '/' + assetId);

            const response1 = await request({
                url: 'https://api.cesium.com/v1/assets/' + assetId,
                method: 'DELETE',
                headers: { Authorization: `Bearer ${global.accessToken}` },
                json: true,
            });

            process.exit(0); //Or whatever you do on completion, such as calling your callback or resolving a promise with the data
        }
    });
}

createAsset();


