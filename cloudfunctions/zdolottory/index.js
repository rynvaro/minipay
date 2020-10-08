// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    return await db.collection('lottories').add({
        data: {
            avatarUrl: event.avatarUrl,
            name: event.name,
            level: event.level,
            openid: wxContext.OPENID,
            probability: 0.01,
            round: event.round,
            phone: event.phone,
            status: 1, // 1 等待审核 2 等待开奖
            t: new Date().getTime(),
            res: event.res,
            eventId: event.eventId,
        }
    })
}