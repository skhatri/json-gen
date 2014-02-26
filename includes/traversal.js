var fs = require('fs');

var flatten = function (attributes, options) {
  var map = {};
  for (var prop in attributes) {
    var attribute = attributes[prop];
    if (attribute.type) {
      var itemType;
      if (attribute.type === 'array') {
        itemType = attribute.items.$ref || attribute.items.items;
        var includedItem = JSON.parse(fs.readFileSync(options.schemaDir + '/' + itemType, 'utf8'));
        var includeProps = flatten(includedItem.properties, options);
        map[prop] = {type: attribute.type, items: includeProps};
      } else {
        var singleProp = {type: attribute.type};
        if (attribute.format) {
          singleProp.format = attribute.format;
        }
        map[prop] = singleProp;
      }
    } else if (attribute.enum) {
      map[prop] = {items: attribute.enum};
    }
  }
  return map;
};

var flattenAll = function (item, options) {
  var map = flatten(item.properties, options);
  var included = item.allOf;
  if (included) {
    for (var c = 0; c < included.length; c += 1) {
      var includedItem = JSON.parse(fs.readFileSync(options.schemaDir + '/' + included[c]["$ref"], 'utf8'));
      var includeProps = flatten(includedItem.properties, options);
      for (var i in includeProps) {
        map[i] = includeProps[i];
      }
    }
  }
  return map;
};

var exports = function (schema, options) {
  var map = flattenAll(schema, options);
  console.log(JSON.stringify(map, null, '  '));
  return schema;
};

module.exports = exports;
