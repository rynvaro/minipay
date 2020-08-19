// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const openid = wxContext.OPENID

    var merchant = {}
    try {
        merchant = await db.collection("stores").doc(event.phone).get()
    }catch(e) {
        throw(e)
    }

    return merchant
}