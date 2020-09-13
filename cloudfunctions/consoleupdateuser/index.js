// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let tp = event.tp

    if (tp == 2) {
        return await db.collection('icoupons').add({
            data: {
                coupon: {
                    "id": 1,
                    "point": 50,
                    "type": 3,
                    "value": 500,
                },
                openid: event._id,
                status: 0,
                timestamp: Date.parse(new Date())
            }
        })
    }

    let id = event._id 
    return await db.collection('users').doc(id).update({
        data: {
            createdAt: event.createdAt,
            data: event.data,
            inviteCode: event.inviteCode,
            payPassword: event.payPassword,
            updateAt: Date.parse(new Date())
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