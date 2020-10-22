// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        const user = await db.collection('users').doc(wxContext.OPENID).get()

        const signConfs = await db.collection('signconfs').get()
        let signconf = signConfs.data[0]


        let signDate = user.data.data.signDate
        var sevenSigns = user.data.data.sevenSigns + 1

        let todayStart = new Date()
        todayStart.setHours(-8,0,0,0)
        let todayStartTime = todayStart.getTime()
        console.log("todayStartTime: ", todayStartTime)
        if (signDate >= todayStartTime) { // 今日已签到
            return 2
        }

        let yesterdayStart = new Date()
        yesterdayStart.setHours(-32, 0, 0, 0)
        let yesterdayStartTime = yesterdayStart.getTime()
        console.log("yesterdayStartTime: ", yesterdayStartTime)

        let confs = signconf.confs
        if (signDate == 0) { // 第一次签到
            confs = signconf.onSaleConfs
        }else {
            if (signDate < yesterdayStartTime) {
                // 昨日未签到
                confs = signconf.confs
                user.data.data.signs = 10
                sevenSigns = 1
            }else { // 昨日签到过
                if (user.data.data.sevenSigns > 0 && user.data.data.signs < 7) {
                    confs = signconf.onSaleConfs
                }
            }
        }

        if (sevenSigns > 7) {
            sevenSigns = 1
        }

        let index = sevenSigns - 1
        pointDelta = confs[index]

        await db.collection('users').doc(wxContext.OPENID).update({
            data: {
                data: {
                    signDate: new Date().getTime(),
                    signs: user.data.data.signs + 1,
                    point: user.data.data.point + pointDelta,
                    sevenSigns: sevenSigns,
                }
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })

        // 积分变更记录
        await db.collection('pointrecords').add({
            data: {
                openid: wxContext.OPENID,
                type: 1, // 签到
                action: '+',
                value: pointDelta,
                timestamp: Date.parse(new Date()),
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })



    }catch(e) {
        throw(e)
    }


    return 1
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