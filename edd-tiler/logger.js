var fs = require("fs");
var path = require("path");

const LOG_CONSOLE_TYPE = 0;
const LOG_FILE_TYPE = 1;

//var logType = LOG_CONSOLE_TYPE;
var logType = LOG_CONSOLE_TYPE;

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, 
        "d+": this.getDate(), 
        "h+": this.getHours(), 
        "m+": this.getMinutes(), 
        "s+": this.getSeconds(), 
        "q+": Math.floor((this.getMonth() + 3) / 3), 
        "S": this.getMilliseconds() 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

function mkdirpath(dirPath)
{
    'use strict';
    if(!fs.existsSync(dirPath))
    {
        try
        {
            fs.mkdirSync(dirPath);
        }
        catch(e)
        {
            mkdirpath(path.dirname(dirPath));
            mkdirpath(dirPath);
        }
    }
}

Object.defineProperty(global, '__stack', {
    get: function(){
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack){ return stack; };
        var err = new Error;
        //noinspection JSUnresolvedFunction
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

function log(message, filename, tag, ignoreMetaData) {
    //noinspection JSUnresolvedFunction
    var sourceFileName = __stack[2].getFileName();

    sourceFileName = path.basename(sourceFileName);

    //noinspection JSUnresolvedFunction
    var methodName = __stack[2].getMethodName();

    //noinspection JSUnresolvedFunction
    var line =  __stack[2].getLineNumber();

    var dateStr = new Date().Format("yyyy-MM-dd");
    var timeStr = new Date().Format("hh:mm:ss");

    var info = dateStr + " " + timeStr + " ";

    info = info + "<" + tag + ">" + " ";
    info = info + sourceFileName + ":" + line;

    if(methodName) {
        info = " " + info + "(" + methodName + ")";
    }

    if(ignoreMetaData) {
        info = message;
    }
    else {
        info = info + " " + message;
    }

    if (logType == LOG_FILE_TYPE) {
        info = info + "\r\n";
    }

    if (logType == LOG_CONSOLE_TYPE) {
        console.log(info);
    }
    else if (logType == LOG_FILE_TYPE) {
        var directory = path.join(__dirname, '..');

        var sep = path.sep;

        directory = directory + sep + "log" + sep + dateStr;

        mkdirpath(directory);

        if (filename == null) {
            filename = "common";
        }

        filename = directory + sep + filename + ".log";

        fs.appendFileSync(filename, info);
    }
    else {
        console.log(info);
    }
}

exports.log = function (message, filename, ignoreMetaData) {
    log(message, filename, "log", ignoreMetaData);
};

exports.info = function (message, filename) {
    log(message, filename, "info");
};

exports.warning = function (message, filename) {
    log(message, filename, "warning");
};

exports.error = function (message, filename) {
    log(message, filename, "error");
};
