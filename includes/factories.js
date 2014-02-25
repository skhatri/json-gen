var helper = require('./helper'), traversal=require('./traversal'), fs = require('fs');

function ValueFactory(type) {
    this.type = type;
}

ValueFactory.prototype.getValue = function () {
    return null;
};

function StringValueFactory() {
    this.type = "string";
}

var counter = 0;

StringValueFactory.prototype = Object.create(ValueFactory.prototype);
StringValueFactory.prototype.getValue = function (attribute) {
    if (attribute.format === "date") {
        return helper.anyDate();
    }
    if (attribute.format === "date-time") {
        return helper.anyDateTime();
    }
    if (attribute.id === "#email" || attribute.format === "email") {
        return "fakeemail_" + helper.randomStr(5) + "@gmail.com";
    }
    return helper.randomStr(20);
};


var numberFactory = {
    type: "number",
    getValue: function () {
        return helper.twoDecimal(1000);
    }
};

var integerFactory = {
    type: "integer",
    getValue: function () {
        return helper.randomInt(0, 100000);
    }
};

var options = {};

var specializedForm = function (ref) {
    if (options.subtypeDelegate) {
        return options.subtypeDelegate(ref);
    }
    return ref;
};


var arrayFactory = {
    type: "array",
    getValue: function (attribute) {
        var min = attribute.minItems === undefined ? 1 : attribute.minItems;
        var max = attribute.maxItems === undefined ? helper.randomInt(1, 5) : attribute.maxItems;
        var size = helper.randomInt(min, max);
        var items = [];
        var ref = attribute.items.$ref;
        if (ref) {
            var text = fs.readFileSync(options.schemaDir + '/' + specializedForm(ref), 'utf8');
            var item = JSON.parse(text);
            for (var i = 0; i < size; i += 1) {
                items.push(produceAll(item));
            }
        } else {
            var type = attribute.items.type;
            for (var i = 0; i < size; i += 1) {
                items.push(produce({id: attribute.id, type: type}));
            }
        }
        return items;
    }
};

var objectFactory = {
    type: "object",
    getValue: function (attribute) {
        var ref = attribute.$ref;
        if (ref) {
            var text = fs.readFileSync(options.schemaDir + '/' + specializedForm(ref), 'utf8');
            var item = JSON.parse(text);
            return produceAll(item);
        } else {
            return null;
        }
    }
};


var valueFactories = [];
valueFactories.push(integerFactory);
valueFactories.push(numberFactory);
valueFactories.push(new StringValueFactory());
valueFactories.push(arrayFactory);
valueFactories.push(objectFactory);

var createValue = function (attribute, map) {
    var type = attribute.type;
    for (var i = 0; i < valueFactories.length; i += 1) {
        if (valueFactories[i].type === type) {
            return valueFactories[i].getValue(attribute, map);
        }
    }
    return null;
};

var replaceFactory = function (factory) {
    var idx = -1;
    for (var a = 0, max = valueFactories.length; a < max; a += 1) {
        if (valueFactories[a].type === factory.type) {
            idx = a;
        }
    }
    if (idx !== -1) {
        valueFactories.splice(idx, 1, factory);
    }
};

var addFactory = function (factory) {
    valueFactories.push(factory);
};

var produce = function (attributes) {
    var map = {};
    for (var prop in attributes) {
        var attribute = attributes[prop];
        if (attribute.type) {
            map[prop] = createValue(attribute, map);
        } else if (attribute.enum) {
            var value = attribute.enum[parseInt(attribute.enum.length * Math.random())];
            map[prop] = value;
        }
    }
    return map;
};

var produceAll = function (item) {
    var map = produce(item.properties);
    var included = item.allOf;
    if (included) {
        for (var c = 0; c < included.length; c += 1) {
            var includedItem = JSON.parse(fs.readFileSync(options.schemaDir + '/' + included[c]["$ref"], 'utf8'));
            var includeProps = produce(includedItem.properties);
            for (var i in includeProps) {
                map[i] = includeProps[i];
            }
        }
    }
    return map;
};

var readEntity = function(entity) {
  var entityText = fs.readFileSync(options.schemaDir + '/' + entity + options.ext, 'utf8');
  var item = JSON.parse(entityText);
  return item;
};

var init = function (opts) {
    options = opts || {};
    options.schemaDir = options.schemaDir || '.';
    options.ext = options.ext || '.json';
    options.saveDir = options.saveDir || '.';
    options.saveAppender = options.saveAppender !== undefined ? options.saveAppender : '.example';
    options.persist = options.persist === undefined || options.persist;
};


var createSample = function (entity) {
    var item = readEntity(entity);

    var map = produceAll(item);
    if (!map.id) {
        map.id = helper.id();
    }
    var text = JSON.stringify(map);
    if (options.persist) {
        fs.writeFileSync(options.saveDir + '/' + entity + options.saveAppender + options.ext, text, 'utf8');
    }
    return text;
};

var compile = function(options) {
  options = options || {};
  options.entity = options.entity || 'none';
  init(options);
  var item = readEntity(options.entity);
  return traversal(item);
};


module.exports = {
    init: init,
    addFactory: addFactory,
    replaceFactory: replaceFactory,
    createSample: createSample,
    compile: compile
};
