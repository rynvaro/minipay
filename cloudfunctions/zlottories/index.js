// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log("event is: ",event)

    const joinedusers = await db.collection('lottories').where({round: event.round, eventId: event.eventId}).orderBy('t','desc').limit(event.limit).get()
    const len = await db.collection('lottories').where({round: event.round, eventId: event.eventId}).count()
    return {
        data: joinedusers.data,
        len: len,
    }
}