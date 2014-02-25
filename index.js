var factories = require('./includes/factories');

var generate = function (options) {
    options = options || {};
    options.entity = options.entity || 'none';
    factories.init(options);
    return factories.createSample(options.entity);
};

var exports = {
    generate: generate,
    addFactory: factories.addFactory,
    replaceFactory: factories.replaceFactory,
    compile: factories.compile
};

module.exports = exports;
