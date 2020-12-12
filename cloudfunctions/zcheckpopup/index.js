// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const mstore = await db.collection('mstores').doc(event.id).get()

    let canUseBalance = true
    if (mstore.data.canUseBalance == false) {
        canUseBalance = false
    }
    if (!mstore.data.isPopup) {
        return {isPopup: false, canUseBalance: canUseBalance}
    }

    let confirmed = false
    let orderId = ''
    const iorders = await db.collection('iorders').where({eventId: mstore.data.eventId, openid: wxContext.OPENID, payType: 3}).get()
    console.log("sssss", iorders)
    if (iorders.data.length > 0) {
        console.log(iorders)
        if (iorders.data[0].pay3Confirmed) {
            confirmed = true
            orderId = iorders.data[0]._id
        }
    }

    
    return {isPopup: true, confirmed: confirmed, orderId: orderId, canUseBalance: canUseBalance}
}