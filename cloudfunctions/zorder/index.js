// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const iorder = await db.collection('iorders').doc(event.id).get()
    
    let coupon = {
        data: {
            coupon: {
                value: 0
            }
        }
    }
    if (iorder.data.couponId != -1) {
        coupon = await db.collection('icoupons').doc(iorder.data.couponId).get()
    }

    return {
        order: iorder.data,
        coupon: coupon
    }
}