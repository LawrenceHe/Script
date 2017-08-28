XLSX = require('xlsx');
var workbook = XLSX.readFile('../Attached file- localtone-08_28-10_12_27.xlsx');

var first_sheet_name = workbook.SheetNames[0];
var worksheet = workbook.Sheets[first_sheet_name];

const keys = Object.keys(worksheet);
var cursor = 3;
var data = {};

var result = {
    tcpcount:0,
    tcpsuccess:0,
    tcpsuccessrate:0,
    tcpavgtime:0,
    soacount:0,
    soasuccess:0,
    soasuccessrate:0,
    soaavgtime:0,
};

// xlsx文件的数据并不是表格式的二维数组，而是一个一维数组
// Key就是A1,A2,B2...,Value就是所对应的cell里面的值
keys.filter(k => k[0] !== '!')
.forEach(k => {
    let col = k.substring(0, 1);
    let row = parseInt(k.substring(1));

    if (row <= 2 || row >5000) {
        return;
    }
    
    if (cursor < row) { // 换行
        if (data && data.env) {
            let env = JSON.parse(data.env);
            //console.log(env.os);
            // 兼容IOS老版本的value
            if (env.os.toLowerCase() == 'ios' && env.appVersion < '1.2.0') {
                //console.log(env.appVersion);
                data.value = Math.round(data.value * 1000);
                //console.log(data);
            }
        }
        
        let tag = JSON.parse(data.tags);
        // 剔除掉首页的请求
        // if (tag.pageCode == '10320664102') {
            // 计数
            if (data.name === 'o_localtone_sotp_monitor') {
                result.tcpcount++;
                let succ = parseInt(tag.success);
                if (succ) {
                    result.tcpsuccess++;
                    result.tcpavgtime+=data.value;
                }
            } else if (data.name === 'o_localtone_soa_monitor') {
                result.soacount++;
                let succ = parseInt(tag.success);
                if (succ) {
                    result.soasuccess++;
                    result.soaavgtime+=data.value;
                }
            }
        //}
        
        //console.log(data);
        cursor = row;
        data = {};
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
                .replace(/[\u0000-\u0019]+/g,"");
    }
});

result.tcpsuccessrate = result.tcpsuccess / result.tcpcount;
result.soasuccessrate = result.soasuccess / result.soacount;
result.tcpavgtime = result.tcpavgtime / result.tcpsuccess;
result.soaavgtime = result.soaavgtime / result.soasuccess;
console.log(result);
