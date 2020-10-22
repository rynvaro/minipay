// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  })
  
  const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    let orderId = event.orderId

    const order = await db.collection('iorders').doc(orderId).get()
    const user = await db.collection('users').doc(wxContext.OPENID).get()

    let payAmount = order.data.totalAmount
    let point = parseInt(payAmount/10)
    let exp = point

    return {
        payAmount: payAmount,
        point: point,
        exp: exp,
        toNextLevel: user.data.data.expTotal - user.data.data.exp
    }
}