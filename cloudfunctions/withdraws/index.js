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

    var result = {}

    try {
        result = await db.collection("withdraws").where({ storeID: event.storeID}).get()
    } catch(e) {
        throw(e)
    }

    return result
}