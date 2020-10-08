// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})


// 云函数入口函数
exports.main = async (event, context) => {
    
    const iorder = await db.collection('iorders').doc(event.id).get()
    if (iorder.data.couponId != -1) {
        await db.collection('icoupons').doc(iorder.data.couponId).update({
            data: {
                status: 1,
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })
    }
    return await db.collection('iorders').doc(event.id).update({
        data: {
            pay3Confirmed: true
        }
    })
}