var csv = require('csv-parser');
var fs = require('fs');
var rs = fs.createReadStream('test.csv');
//var d = require('./data.json');

var statistic = {};
rs.pipe(csv())
    .on('data', function(data) {
        //console.log(data);
        //let mid = data['﻿meta.id'];
        //let osver = data['systemVersion, 操作系统版本, agent.osVer'];
        let detail = JSON.parse(data._detail_);
        let uid = detail['user.id'];
        if (uid != undefined) {
            let count = statistic[uid] || 0;
            statistic[uid] = count +1;
        }
    })
    .on('end', function() {
        console.log(statistic);
    });