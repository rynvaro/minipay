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

    if (!event.id) {
        return -1
    }

    let type = event.type 
    delete event.type

    if (type == 'merchant') {
        await db.collection('mstores').doc(event.id).update({
            data: {
                merchantName: event.merchantName,
                merchantBankCard: event.merchantBankCard,
                merchantPhone: event.merchantPhone,
                bank: event.bank,
                openid: wxContext.OPENID,
                complete: true,
                updatedAt: Date.parse(new Date()),
            },
            success: res => {
                console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [更新记录] 失败：', err)
                throw("update error")
            }
        })
    }else if (type == 'store'){
        await db.collection('mstores').doc(event.id).update({
            data: {
                address: event.address,
                startTime: event.startTime,
                endTime: event.endTime,
                storeDesc: event.storeDesc,
                storeType: parseInt(event.storeType),
                storeTypeOne: parseInt(event.storeTypeOne),
                geoPoint: db.Geo.Point(event.longitude, event.latitude),
                longitude: event.longitude,
                latitude: event.latitude,
                storeName: event.storeName,
                openid: wxContext.OPENID,
                updatedAt: Date.parse(new Date()),
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