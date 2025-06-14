// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
// 优惠券字典表
exports.main = async (event, context) => {
    const coupons = await db.collection('coupons').get()
    return {
        data: coupons.data[0],
    } 
}