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

    var request = require('request');
    var yoyo = "e295095220"
    // USER("0")普通用户
    // LEADER("1")领队
    // EXPERT("2")达人
    // AGENT("3")客服
    // HOST("5")群主
    var role = '5'
    var count = 0

    for (item in groupinfo) {
        console.log(item)
        // 移除现有群主
        let jid = groupinfo[item]['group_jid']
        let uid = groupinfo[item]['UID']
        let USER_DATA = {"groupJid":jid, "userJids":[uid],"operatorname":uid}
        console.log(USER_DATA);
        let options = {
            method: 'POST',
            url: 'http://webapi.soa.ctripcorp.com/api/11611/removeMember',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(USER_DATA))
            },
            json: USER_DATA
        };
    
        request(options, function(error, response, body){
            console.log('removeMember')
            console.log(error)
            console.log(body)
        })
    
        // 设置游游为群主
        let USER_DATA1 = {"userJid":yoyo,"groupJid":jid,"role":role,"reason":"yoyo as group owner"}
        console.log(USER_DATA1);
        let options1 = {
            method: 'POST',
            url: 'http://webapi.soa.ctripcorp.com/api/11611/changeGroupRole',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(USER_DATA1))
            },
            json: USER_DATA1
        };
    
        request(options1, function(error, response, body){
            console.log('changeGroupRole')
            console.log(error)
            console.log(body)
        })
    
        count++
        if (count == 1) {
            break
        }
    }
}
