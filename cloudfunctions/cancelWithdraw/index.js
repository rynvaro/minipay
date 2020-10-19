// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        const w = await db.collection('withdraws').doc(event.id).get()
        if (w.data.status == 4) {
            throw("invalid operation")
        }
        await db.collection('withdraws').doc(event.id).update({
            data: {
                status: 4,
                updatedAt: Date.parse(new Date())
            },
            success: res => {
                console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [更新记录] 失败：', err)
                throw("update error")
            }
        })

        var withdrawHis = await db.collection("withdraws").doc(event.id).get()

        mstore = await db.collection("mstores").doc(event.storeID).get()
        // 更新余额 TODO 需要保证事务
        await db.collection('mstores').doc(event.storeID).update({
            data: {
                balance: mstore.data.balance + withdrawHis.data.withdrawAmount,
                updatedAt: Date.parse(new Date()),
            },
            success: res => {
                console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [更新记录] 失败：', err)
                throw("update error")
            }
        })

    } catch(e) {
        throw(e)
    }

    return {}
}