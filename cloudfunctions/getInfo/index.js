// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {

    console.log(event)
    var mstore = {}
    const _ = db.command
    try {
        mstore = await db.collection("mstores").doc(event.storeID).get()
        let now = new Date()
        now.setHours(0, 0, 0, 0)
        let today = now.getTime()
        console.log(today,"-----")
        const orders = await db.collection('orders').where({
            storeId: _.eq(event.storeID), 
            timestamp: _.gte(today)
        }).get()
        let dayIncome = 0
        for (var i = 0; i< orders.data.length; i++) {
            console.log(orders.data[i].timestamp, today, orders.data[i]>today)
            if (orders.data[i].finalAmount) {
                dayIncome += orders.data[i].finalAmount
                dayIncome += orders.data[i].realCoupon
            }
        }
        mstore.data.dayIncome = dayIncome.toFixed(2)
        mstore.data.dayOrders = orders.data.length
    }catch(e) {
        throw(e)
    }

    return mstore
}