var text = require('./index').compile({schemaDir: 'schema', entity: 'Person', persist: false});
console.log(text);
