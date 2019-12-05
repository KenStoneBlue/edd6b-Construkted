const fs = require('fs');

const State = {
    Unknown: 'Unknown',
    Creating: 'Creating',
    Uploading: 'Uploading',
    Tiling: 'Tiling',
    Downloading: 'Downloading',
    Packaging: 'Packaging',
    Deleting: 'Deleting',
    Moving: 'Moving'
};

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNWU3YWY1MS1lNmUyLTRiMzAtYmVhZS1jNGVkMzVkYzU0MzIiLCJpZCI6MjkyMSwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTU3NTM2OTg5NX0.24GRSi6fRXbilevELFVtUPsuaN-YrU6gjNw63jG4soQ';

exports.readJsonFile =  function (path) {
    let jsonRawData = fs.readFileSync(path);

    return JSON.parse(jsonRawData);
};

exports.State = State;
exports.accessToken = accessToken;
exports.monitorFolder = 'E:/tiling';
exports.node = 'node';
exports.python = 'C:/Users/ugi/AppData/Local/Programs/Python/Python37/python.exe';
exports.downloader = 'E:/0Source/Edd6/edd6-Construkted/asset_downloader/asset_downloader-v3.py';
exports.downloaderThreadCount = 10;
exports.downloadPath = 'E:/0Source/Edd6/edd6-Construkted/asset_downloader';
exports.tilesToolsPath = 'E:/0Source/Edd6/3d-tiles-tools/tools/bin/3d-tiles-tools.js';
exports.s3Location = 'E:/0Source/Edd6/S3';


