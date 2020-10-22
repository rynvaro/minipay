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
    let offse1t = todayStart.getTimezoneOffset()
    console.log('a offset is: ',offse1t)
    
    todayStart.setHours(-8,0,0,0)
    let todayStartTime = todayStart.getTime()

    let offset = todayStart.getTimezoneOffset()
    console.log('offset is: ',offset)
    console.log(todayStartTime)

    if (signDate < todayStartTime) {
        result.status = -1
        result.msg = '今天还未签到哦~~'
    }

    return result
}