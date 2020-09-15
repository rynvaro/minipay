// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
// 获取店铺信息，计算打折等信息。
exports.main = async (event, context) => {
    let storeID = event.storeID
    
    return await db.collection('mstores').doc(storeID).get()
}