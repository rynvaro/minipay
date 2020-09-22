// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()


    try {
        var msgR = await cloud.openapi.security.msgSecCheck({
            content: JSON.stringify(event)
        })
        console.log(msgR)
    }catch(e) {
        return e
    }

    return await db.collection('feedbacks').add({
        data: {
            openid: wxContext.OPENID,
            title: event.title,
            content: event.content,
            timestamp: Date.parse(new Date()),
        },
        success: res => {
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
            console.error('[数据库] [新增记录] 失败：', err)
            throw(err)
        }
    })
}