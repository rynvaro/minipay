// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const user = await db.collection('users').doc(wxContext.OPENID).get()

    let result = {
        status: 1,
        msg: 'ok'
    }
    let signDate = user.data.data.signDate

    let todayStart = new Date()
    let offset = todayStart.getTimezoneOffset()
    todayStart.setHours(todayStart.getHours()+8-offset,0,0,0)
    todayStart.setHours(-8,0,0,0)
    let todayStartTime = todayStart.getTime()

    console.log("sign date: ", signDate)
    console.log("today start: ",todayStartTime)

    if (signDate < todayStartTime) {
        result.status = -1
        result.msg = '今天还未签到哦~~'
    }

    return result
}