var dateformat = require('dateformat'), sha1 = require('sha1');

var oneOf = function (arr) {
    return arr[parseInt(Math.random() * arr.length)];
};

var random = function (min, max) {
    var value = Math.random() * (max - min) + min;
    value = value > max ? max : value;
    return value;
};

var twoDecimal = function (max) {
    return Number(Number(random(0, max)).toFixed(2));
};


var randomInt = function (min, max) {
    return parseInt(random(min, max), 10);
};
var ONE_DAY = 86400000;

var dateInTheLastNDays = function (n) {
    var date = new Date(new Date().getTime() - Math.random() * n * ONE_DAY);
    return date;
}
var anyDate = function () {
    return dateformat(dateInTheLastNDays(30), "yyyy-mm-dd");
};

var anyDateTime = function () {
    return dateformat(dateInTheLastNDays(30), "isoDateTime");
};

var lowerCaseCharacter = function() {
    var v = parseInt(Math.random() * 26) + 97;
    return String.fromCharCode(v);
}

var randomStr = function (size) {
    var len = parseInt(Math.random() * size);
    var d = []
    for (var i = 0; i < len; i += 1) {
        d.push(lowerCaseCharacter());
    }
    return d.join("");
};

var counter= randomInt(0, 100);

var id = function() {
    var val = lowerCaseCharacter() + lowerCaseCharacter()+ String(randomInt(1000, 9000)) + String(process.pid) + String(counter++) + Date.now();
    return sha1(val);
}

module.exports = {
    id: id,
    oneOf: oneOf,
    random: random,
    twoDecimal: twoDecimal,
    randomInt: randomInt,
    randomStr: randomStr,
    anyDate: anyDate,
    anyDateTime: anyDateTime,
    dateInTheLastNDays: dateInTheLastNDays
};
