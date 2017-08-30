var XLSX = require('xlsx');
var fs = require('fs');
var path = require('path');
var dir = '../';

// 判断日期是否在指定日期范围内
var startDate  = (process.argv[2] ? process.argv[2] : '0.0').split('.');
var endDate = (process.argv[3] ? process.argv[3] : '100.100').split('.');
function dateInRange(date) {
    date = date.split('.');
    if (Number.parseInt(date[0]) >= Number.parseInt(startDate[0])
        && Number.parseInt(date[0]) <= Number.parseInt(endDate[0])
        && Number.parseInt(date[1]) >= Number.parseInt(startDate[1])
        && Number.parseInt(date[1]) <= Number.parseInt(endDate[1])) {
        return true;
    } else {
        return false;
    }
}

// 遍历整个目录
fs.readdirSync(dir).forEach(function (file) {
    let pathname = path.join(dir, file);
    file = file.replace(/-\d\d_\d\d_\d\d.xlsx/, '')
            .replace('Attached file- localtone-', '')
            .replace('_', '.');
    // 只解析指定日期
    if (pathname.indexOf('localtone') != -1 && dateInRange(file)) {
        console.log(file);
        var workbook = XLSX.readFile(pathname);
        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];

        const keys = Object.keys(worksheet);
        var cursor = 3;
        var data = {};

        var result = {
            tcpcount: 0,
            tcpsuccess: 0,
            tcpsuccessrate: 0,
            tcpavgtime: 0,
            soacount: 0,
            soasuccess: 0,
            soasuccessrate: 0,
            soaavgtime: 0,
        };

        // xlsx文件的数据并不是表格式的二维数组，而是一个一维数组
        // Key就是A1,A2,B2...,Value就是所对应的cell里面的值
        keys.filter(k => k[0] !== '!')
            .forEach(k => {
                let col = k.substring(0, 1);
                let row = parseInt(k.substring(1));

                if (row <= 2) {
                    return;
                }

                // 换行时处理数据
                if (cursor < row) {
                    cursor = row;
                    let d = data;
                    data = {};

                    // 剔除ios特定版本的数据
                    if (d && d.env) {
                        try {
                            let env = JSON.parse(d.env);
                            if (env.os.toLowerCase() == 'ios' && env.appVersion <= '1.2.0') {
                                return;
                            }
                        } catch (e) {
                            return;
                        }
                    }

                    // 剔除掉首页的请求
                    //if (tag.pageCode == '10320664100') {
                    //    return;
                    //}

                    let tag = JSON.parse(d.tags);
                    // 计数
                    if (d.name === 'o_localtone_sotp_monitor') {
                        result.tcpcount++;
                        let succ = parseInt(tag.success);
                        if (succ) {
                            result.tcpsuccess++;
                            result.tcpavgtime += d.value;
                        }
                    } else if (d.name === 'o_localtone_soa_monitor') {
                        result.soacount++;
                        let succ = parseInt(tag.success);
                        if (succ) {
                            result.soasuccess++;
                            result.soaavgtime += d.value;
                        }
                    }
                }

                let value = worksheet[k].v;
                if (col === 'I') {
                    data.name = value;
                } else if (col === 'J') {
                    data.value = value;
                } else if (col === 'K') {
                    data.tags = value;
                } else if (col === 'L') {
                    // preserve newlines, etc - use valid JSON
                    data.env = value.replace(/\\n/g, "\\n")
                        .replace(/\\'/g, "\\'")
                        .replace(/\\"/g, '\\"')
                        .replace(/\\&/g, "\\&")
                        .replace(/\\r/g, "\\r")
                        .replace(/\\t/g, "\\t")
                        .replace(/\\b/g, "\\b")
                        .replace(/\\f/g, "\\f")
                        // remove non-printable and other non-valid JSON chars
                        .replace(/[\u0000-\u0019]+/g, "");
                }
            });

        result.tcpsuccessrate = result.tcpsuccess / result.tcpcount;
        result.soasuccessrate = result.soasuccess / result.soacount;
        result.tcpavgtime = result.tcpavgtime / result.tcpsuccess;
        result.soaavgtime = result.soaavgtime / result.soasuccess;
        console.log(result);

    }
});
