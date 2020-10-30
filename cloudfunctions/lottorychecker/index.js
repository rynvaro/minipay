// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const events = await db.collection('events').where({type: '2', status: 1}).get()

    let l1 = []
    let l2 = []
    let l3 = []
    let lo = []

    let l1Tips = ''
    let l2Tips = ''
    let l3Tips = ''

    var currentEvent = {}

    const _ = db.command

    if (events.data.length > 0) {
        for (var i = 0; i<  events.data.length; i++) {
            currentEvent = events.data[i]
            let datetime = new Date()
            console.log(datetime.getTime())
            let offset = datetime.getTimezoneOffset()
            console.log("offset is: ", offset)
            // datetime.setHours(datetime.getHours() + 8 - offset,datetime.getMinutes(),datetime.getSeconds())
            console.log(datetime.getTime())
            console.log(Date.parse(events.data[i].lottoryTime))
            console.log("jah: ",datetime.getTime() >= Date.parse(events.data[i].lottoryTime))
            if (datetime.getTime() >= Date.parse(events.data[i].lottoryTime)) {
                // 计算中奖
                var joinedusers = []


                var tmpJoinedusers = []
                let count =await getCount(events.data[i]._id);
                count = count.total;
                for (let ii = 0; ii < count; ii += 100) {
                    tmpJoinedusers = tmpJoinedusers.concat(await getList(events.data[i]._id,ii));
                }

                // 检查是否消费了
                for (var xx =0; xx< tmpJoinedusers.length; xx++) {
                    const orders = await db.collection('iorders').where({
                        timestamp: _.gte(events.data[i].timestamp).and(_.lte(new Date().getTime())),
                        status: 1,
                        openid: tmpJoinedusers[xx].openid,
                    }).get()
                    if (orders.data.length > 0) {
                        joinedusers.push(tmpJoinedusers[xx])
                    }
                }
                
                console.log("joined users: ",joinedusers)
                if (joinedusers.length == 0) {
                    continue
                }
                

                let l1cnt = parseInt(events.data[i].lottory1Count)
                let l2cnt = parseInt(events.data[i].lottory2Count)
                let l3cnt = parseInt(events.data[i].lottory3Count)

                l1Tips = events.data[i].lottory1
                l2Tips = events.data[i].lottory2
                l3Tips = events.data[i].lottory3

                console.log("cntis: ",l1cnt,l2cnt,l3cnt)
                // l1
                for (var x = 0; x< l1cnt; x++) {
                    let index = Math.floor(Math.random()*joinedusers.length)
                    l1.push(joinedusers[index])
                    joinedusers.splice(index,1)
                }

                // l2
                for (var x = 0; x< l2cnt; x++) {
                    let index = Math.floor(Math.random()*joinedusers.length)
                    if (joinedusers.length == 0) {
                        continue
                    }
                    l2.push(joinedusers[index])
                    joinedusers.splice(index,1)
                }

                // l3
                for (var x = 0; x< l3cnt; x++) {
                    let index = Math.floor(Math.random()*joinedusers.length)
                    if (joinedusers.length == 0) {
                        continue
                    }
                    l3.push(joinedusers[index])
                    joinedusers.splice(index,1)
                }
                if (joinedusers.length > 0) {
                    lo = joinedusers
                }

                await db.collection('events').doc(events.data[i]._id).update({data:{status: 2}})

                await db.collection('winners').add({
                    data: {
                        l1: l1,
                        l2: l2,
                        l3: l3,
                    }
                })
            }
        }
    }

    console.log("_------------")
    console.log(l1,l2,l3)

    // 发送未中奖通知
    for (var i = 0;i<lo.length;i++) {
        if (lo[i].res['qAEG6JGuqUmi3_YEBQc7Rfo2XgqDqXZkAyjIMmH63-A'] == 'accept') {
            cloud.openapi.subscribeMessage.send({
                touser: lo[i].openid,
                templateId:'qAEG6JGuqUmi3_YEBQc7Rfo2XgqDqXZkAyjIMmH63-A',
                // page: 'pages/lottory/lottory?event='+JSON.stringify(currentEvent),
                page: 'pages/index/index',
                // miniprogramState: 'developer',
                data: {
                    thing1: {
                        value: '免单抽奖',
                    },
                    thing3: {
                        value: '感谢参与，关注我们后续更多福利'
                    },
                    thing2:{
                        value: '抽奖活动已开奖'
                    },
                },
            })
        }
    }

    

    // 发送中奖通知
    for (var i = 0; i<l1.length;i++) {
        if (l1[i].res['2VGO0yMwUtSXL_OcPbO3BNhVJJV4W0GI_Bgmpe4YOXg'] == 'accept') {
            cloud.openapi.subscribeMessage.send({
                touser: l1[i].openid,
                templateId:'2VGO0yMwUtSXL_OcPbO3BNhVJJV4W0GI_Bgmpe4YOXg',
                page: 'pages/lottory/lottory?event='+JSON.stringify(currentEvent),
                // miniprogramState: 'developer',
                data: {
                    phrase1: {
                        value: '免单抽奖',
                    },
                    date2: {
                        value: formatDate(new Date())
                    },
                    thing3:{
                        value: '联系公众号回复 免单 添加客服返还消费金'
                    },
                    thing4: {
                        value: l1[i].name+'恭喜您抽中免单资格'
                    }
                },
            })
        }
    }

    for (var i = 0; i<l2.length;i++) {
        if (l2[i].res['2VGO0yMwUtSXL_OcPbO3BNhVJJV4W0GI_Bgmpe4YOXg'] == 'accept') {
            cloud.openapi.subscribeMessage.send({
                touser: l2[i].openid,
                templateId:'2VGO0yMwUtSXL_OcPbO3BNhVJJV4W0GI_Bgmpe4YOXg',
                page: 'pages/lottory/lottory?event='+JSON.stringify(currentEvent),
                // miniprogramState: 'developer',
                data: {
                    phrase1: {
                        value: '免单抽奖',
                    },
                    date2: {
                        value: formatDate(new Date())
                    },
                    thing3:{
                        value: '联系公众号回复 免单 添加客服返还消费金'
                    },
                    thing4: {
                        value: l2[i].name+' 恭喜您抽中免单资格'
                    }
                },
            })
        }
    }

    for (var i = 0; i<l3.length;i++) {
        if (l3[i].res['2VGO0yMwUtSXL_OcPbO3BNhVJJV4W0GI_Bgmpe4YOXg'] == 'accept') {
            cloud.openapi.subscribeMessage.send({
                touser: l3[i].openid,
                templateId:'2VGO0yMwUtSXL_OcPbO3BNhVJJV4W0GI_Bgmpe4YOXg',
                page: 'pages/lottory/lottory?event='+JSON.stringify(currentEvent),
                // miniprogramState: 'developer',
                data: {
                    phrase1: {
                        value: '免单抽奖',
                    },
                    date2: {
                        value: formatDate(new Date())
                    },
                    thing3:{
                        value: '联系公众号回复 免单 添加客服返还消费金'
                    },
                    thing4: {
                        value: l3[i].name+' 恭喜您抽中免单资格'
                    }
                },
            })
        }
    }

    return {}
}

function formatDate(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return [year, month, day].map(formatNumber).join('.')
  }
  
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}


async function getCount(eventId) {//获取数据的总数，这里记得设置集合的权限
    let where = {eventId: eventId, status: 2}
    let count = await db.collection('lottories').where(where).count();
    return count;
  }
async function getList(eventId,skip) {//分段获取数据
    let where = {eventId: eventId, status: 2}
    let list = await db.collection('lottories').where(where).skip(skip).get();
    return list.data;
}