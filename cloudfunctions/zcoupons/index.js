// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
// 优惠券字典表
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const coupons = await db.collection('coupons').get()
    const user = await db.collection('users').doc(wxContext.OPENID).get()
    
    return {
        data: coupons.data[0],
        viplevel: user.data.data.level,
    } 
}