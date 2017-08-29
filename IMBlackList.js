var bizTypes = [0, 2, 3, 4, 100, 101, 102, 103, 104, 105, 107, 109, 110, 111, 1000, 1100];
var uids = require('../IMBlackListData');
var expireTime = 30 * 24 * 60 * 60;  // 默认禁言30天
var operator = 'admin';

console.log('Black List UIDs:' + uids);

var forbidRules = [];

for (let i in uids) {
    for (let j in bizTypes) {
        let forbidUnit = {
            'forbiddenUser': uids[i], 
            'protectedPartner': bizTypes[j].toString(), 
            'chatType': '', 
            'scope': 'biztype', 
            'expireTime': expireTime, 
            'operator': operator
        }

        forbidRules.push(forbidUnit);
    }
}

var request = require('request');
var USER_DATA = {'forbidRules': forbidRules};
console.log(USER_DATA);
var options = {
    method: 'POST',
    url: 'http://webapi.soa.ctripcorp.com:8080/api/11611/forbid/',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(USER_DATA))
    },
    json: USER_DATA
};

function callback(error, response, body) {
    console.log(error);
    //console.log(response);
    console.log(body);
}

request(options, callback);

// var http = require('http');
// var post_data = {"forbidRules": forbidRules};
// console.log(post_data);
// post_data = JSON.stringify(post_data);

// var post_options = {
//     hostname: 'webapi.soa.ctripcorp.com',
//     port    : '8080',
//     path    : '/api/11611/forbid',
//     method  : 'POST',
//     headers : {
//         'Content-Type': 'application/json',
//         'Cache-Control': 'no-cache',
//         'Content-Length': Buffer.byteLength(post_data)
//     }
// };

// var post_req = http.request(post_options, function (res) {
//     console.log('STATUS: ' + res.statusCode);
//     console.log('HEADERS: ' + JSON.stringify(res.headers));
//     res.setEncoding('utf8');
//     res.on('data', function (chunk) {
//         console.log('Response: ', chunk);
//     });
// });

// post_req.on('error', function(e) {
//     console.log('problem with request: ' + e.message);
// });

// post_req.write(post_data);
// post_req.end();
