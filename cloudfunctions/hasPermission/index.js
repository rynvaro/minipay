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
    console.log(event,"000")

    try {
        const mstore = await db.collection("mstores").doc(event.storeID).get()
        if (mstore.data.openid != openid) {
            throw("permission denied")
        }
    }catch(e) {
        throw(e)
    }

    return {}
}