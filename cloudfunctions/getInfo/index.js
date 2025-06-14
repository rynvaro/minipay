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
        const orders = await db.collection('iorders').where({
            storeId: _.eq(event.storeID),
            timestamp: _.gte(today),
            status: 1,
        }).get()

        let dayIncome = 0
        for (var i = 0; i< orders.data.length; i++) {
            // console.log(orders.data[i].timestamp, today, orders.data[i]>today)
            if (orders.data[i].totalAmount && orders.data[i].status == 1) {
                dayIncome += orders.data[i].totalAmount
                if (orders.data[i].income7) {
                    dayIncome -= orders.data[i].income7
                }
                if (orders.data[i].subsidy) {
                    dayIncome += orders.data[i].subsidy
                }
            }
        }
        mstore.data.dayIncome = dayIncome.toFixed(2)
        mstore.data.dayOrders = orders.data.length
        mstore.data.balance = parseFloat(mstore.data.balance.toFixed(2))
    }catch(e) {
        throw(e)
    }

    return mstore
}