// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

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
    event.balance = 0
    event.orders = 0
    event.password = ''
    event.avgPrice = 0 // TODO 更新订单时候 更新
    event.openid = '',
    event.createdAt = Date.parse(new Date())
    event.updatedAt = Date.parse(new Date())

    event.geoPoint = db.Geo.Point(event.longitude, event.latitude)

    await db.collection('mstores').add({
        data: event,
        success: res => {
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          },
          fail: err => {
            console.error('[数据库] [新增记录] 失败：', err)
            throw(err)
          }
    })

    return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}