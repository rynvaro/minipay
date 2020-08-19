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

    try {
        const merchant = await db.collection("merchants").doc(event.phone).get()
        if (merchant.data.openid != openid) {
            throw("permission denied")
        }
    }catch(e) {
        throw(e)
    }

    return {}
}