"use strict";

var path = require('path');
var fs = require('fs');
var globby = require('globby');

//process.chdir('IonSource');

var sourceFiles = [
    'IonSource/Widgets/Drawing/*.js',
    'IonSource/Widgets/Measure/*.js',
    'IonSource/Widgets/TransformEditor/*.js'
];

globby.sync(sourceFiles).forEach(function(file) {
    var contents = fs.readFileSync(file).toString();

    // ^ asserts position at start of a line
    // . any single character
    // + one or more
    // ? end of line
    var importRegex = /^import.+;?/;

    var newContent = '';

    var match = importRegex.exec(contents);

    if(match.length === 0)
        return;

    for (var i = 0; i < match.length; i++) {
        console.log(match[i]);

        var tokens = match[i].split(/\s+/);

        var importName = tokens[1];

        var newImport = "import {" + importName + "} from 'cesium';\n";

        newContent += newImport;
    }

    var body = contents.replace(importRegex, '');

    newContent += body;

    file = path.relative('IonSource', file);

    file = 'Source/' + file;

    if(fs.existsSync(file))
        fs.unlinkSync(file);

    fs.writeFileSync(file, newContent);
});
