const fs = require('fs');

const State = {
    Unknown: 'Unknown',
    Creating: 'Creating',        // creating Cesium asset
    Uploading: 'Uploading',      // uploading
    Tiling: 'Tiling',            // tiling by Cesium API
    Downloading: 'Downloading',  // downloading tileset tiled by Cesium API
    Packaging: 'Packaging',      // packaging downloaded tileset to sqlite file
    Deleting: 'Deleting',        // deleting downloaded original downloaded tile
    Finished: 'Finished',        // tiling and packaging finished
    Completed: 'Completed',      // corresponding WordPress 's post state is to updated to 'publish'
    ErrorInUpdatePostState: 'ErrorInPostState'
};

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNWU3YWY1MS1lNmUyLTRiMzAtYmVhZS1jNGVkMzVkYzU0MzIiLCJpZCI6MjkyMSwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTU3NTM2OTg5NX0.24GRSi6fRXbilevELFVtUPsuaN-YrU6gjNw63jG4soQ';

exports.State = State;
exports.accessToken = accessToken;
exports.node = 'node';
exports.python = 'C:/Users/ugi/AppData/Local/Programs/Python/Python37/python.exe';
exports.downloader = 'E:/0Source/Edd6/edd6-Construkted/asset_downloader/asset_downloader-v3.py';
exports.downloaderThreadCount = 10;
exports.downloadPath = 'E:/0Source/Edd6/edd6-Construkted/asset_downloader';
exports.tilesToolsPath = 'E:/0Source/Edd6/3d-tiles-tools/tools/bin/3d-tiles-tools.js';
exports.s3UploadLocation = 'E:/0Source/Edd6/S3Upload';
exports.s3AssetLocation = 'E:/0Source/Edd6/S3Assets';
exports.WPServerIp = 'localhost';
exports.WPUpdateProductRESTAPI_EndPoint = '/wordpress5.3/update_product_api/';

exports.port = 5000;

//The operation completely successfully
const ERROR_SUCCESS = 0;
const ERROR_INVALID_PARAMETER = 1;

exports.ERROR_SUCCESS = ERROR_SUCCESS;
exports.ERROR_INVALID_PARAMETER = ERROR_INVALID_PARAMETER;
