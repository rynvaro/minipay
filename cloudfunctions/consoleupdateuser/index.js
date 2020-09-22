// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log("event is: ", event)

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

    // const user = await db.collection('users').doc(id).get()

    // let exp = user.data.exp + event.data.exp
    // if (exp <= 1000) {
    //     event.data.level = 1
    // }else if (exp > 1000 && exp <= 10000) {
    //     event.data.level = 2
    // }else if (exp > 10000) {
    //     event.data.level = 3
    // }

    if (event.data.exp <= 1000) {
        event.data.level = 1
        event.data.expTotal = 1001
    }else if (event.data.exp > 1000 && event.data.exp <=10000) {
        event.data.level = 2
        event.data.expTotal = 10001
    }else if (event.data.exp > 10000) {
        event.data.level = 3
        event.data.expTotal = 10001
    }

    let id = event._id 
    return await db.collection('users').doc(id).update({
        data: {
            createdAt: event.createdAt,
            data: event.data,
            inviteCode: event.inviteCode,
            payPassword: event.payPassword,
            updatedAt: Date.parse(new Date())
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