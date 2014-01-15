var fs = require('fs'), factories = require('./includes/factories');

var generate = function (options) {
    options = options || {};
    options.entity = options.entity || 'none';

    factories.init({schemaDir: options.schemaDir,
        saveDir: options.saveDir,
        subtypeDelegate: options.subtypeDelegate,
        saveAppender: '',
        persist: true
    });
    return factories.createSample(options.entity);
};

var exports = {
    generate: generate
};

module.exports = exports;
