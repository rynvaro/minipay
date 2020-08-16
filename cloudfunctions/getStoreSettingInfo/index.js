// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

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