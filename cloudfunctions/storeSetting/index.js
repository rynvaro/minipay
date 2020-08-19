// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log(event)

    try {
        var msgR = await cloud.openapi.security.msgSecCheck({
            content: JSON.stringify(event)
        })
        console.log(msgR)
    }catch(e) {
        return e
    }

    // 发布到或者更新
    var result
    if (!event.id) {
        result = await db.collection('stores').add({
        data: {
            _id: event.data.phone,
            data: event,
            openid: wxContext.OPENID,
            publishedAt: new Date(),
            updatedAt: new Date()
        },
        success: res => {
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
            console.error('[数据库] [新增记录] 失败：', err)
            throw("add error")
        }
        })
    }else {
        result = await db.collection('stores').doc(event.id).update({
        data: {
            data:event,
            openid: wxContext.OPENID,
            updatedAt: new Date()
        },
        success: res => {
            console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
            console.error('[数据库] [更新记录] 失败：', err)
            throw("update error")
        }
        })
    }

  return {}
}