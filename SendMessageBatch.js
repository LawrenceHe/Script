var csv = require('csv-parser')
var fs = require('fs')
var uuid = require('uuid-js')

// 解析CSV文件
var messageContentInfomation = []
var rs = fs.createReadStream('../MessageContentInfomation.csv')
rs.pipe(csv())
    .on('data', function(data) {
        messageContentInfomation.push(data)
    })
    .on('end', sendMessageBatch)
    .on('error', function(err){
        console.log(err)
    })

function sendMessageBatch() {
    
    for(index in messageContentInfomation) {
        // 解析每行数据 
        let info = messageContentInfomation[index]
        let ownerJid = info['ownerJid']
        let partnerJid = info['partnerJid']
        let messageBody = info['messageBody']

        //console.log(info)
    
        new Promise(function(resolve, reject) {
            // 创建ThreadId
            let jumpLink = "ctrip://wireless/tour_chat?bizType=4&uid=" + ownerJid + "&uidbak=" + partnerJid
            var threadInfo = {
                "thread": {
                    "threadId":"",
                    "subject":"",
                    "nativeLink":jumpLink,
                    "h5Link":jumpLink,
                    "hybirdLink":jumpLink
                }
            }
            let url = 'http://webapi.soa.ctripcorp.com/api/11611/CreateThread'
            let request = require('request')
            let options = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(threadInfo))
                },
                json: threadInfo
            }
            //console.log(threadInfo)
            request(options, function(error, response, body){
                resolve(body)
            })
        }).then(function(body) {
            //console.log(body)
            let threadId = body.threadId
            let msgInfo = {
                ownerJid,
                partnerJid,
                messageBody,
                threadId,
                "localId":uuid.create().hex,
                "bizType":4,
                "localTimeStamp":Date.now(),
                "msgType":0,
                "type":"chat",
                "subject":"",
                "resource":"",
            }
            let url = 'http://webapi.soa.ctripcorp.com/api/11611/SendMessage'
            let request = require('request')
            let options = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(msgInfo))
                },
                json: msgInfo
            }
            //console.log(msgInfo)
            request(options, function(error, response, body){
                console.log(body)
                let count = parseInt(index) + 1
                console.log("success:" + count)
            })
        })
    }
}
