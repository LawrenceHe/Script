// 读取CSV文件
var csv = require('csv-parser')
var fs = require('fs')
var rs = fs.createReadStream('../DirtyGroup.csv')

// 解析CSV文件，获取脏数据群信息
var groupinfo = []
rs.pipe(csv())
    .on('data', function(data) {
        groupinfo.push(data)
    })
    .on('end', cleanDirtyGroup)
    .on('error', function(err){
        console.log(err)
    })

function cleanDirtyGroup() {

    // 游游的UID
    const yoyo = "e295095220"
    // USER("0")普通用户
    // LEADER("1")领队
    // EXPERT("2")达人
    // AGENT("3")客服
    // HOST("5")群主
    const role = '5'
    var count = 0

    for (item in groupinfo) {
        // 移除现有群主
        let jid = groupinfo[item]['group_jid']
        let uid = groupinfo[item]['UID']
        let url = 'http://webapi.soa.ctripcorp.com/api/11611/removeMember'
        let USER_DATA = {"groupJid":jid,"userJids":[uid],"operatorname":uid}
        console.log(USER_DATA)
        postRequest(url, USER_DATA)
    
        // 设置游游为群主
        url = 'http://webapi.soa.ctripcorp.com/api/11611/changeGroupRole'
        USER_DATA = {"userJid":yoyo,"groupJid":jid,"role":role,"reason":"set yoyo as group owner"}
        console.log(USER_DATA);
        postRequest(url, USER_DATA)

        count++
        // if (count == 20) {
        //     break
        // }
    }
}

function postRequest(url, user_data) {
    let request = require('request');
    let options = {
        method: 'POST',
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(user_data))
        },
        json: user_data
    };

    request(options, function(error, response, body){
        console.log(url)
        if (error) {
            console.log(error)
        }
        console.log(body)
    })
}
