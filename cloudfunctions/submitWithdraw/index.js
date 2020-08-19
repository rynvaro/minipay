// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    // 1. 获取用户 检查余额
    try {
        merchant = await db.collection("merchants").doc(event.phone).get()
        if (merchant.data.balance < event.withdrawAmout) {
            throw("insufficient funds")
        }

        await db.collection('withdraws').add({
            data: {
                phone: event.phone,
                withdrawAmount: event.withdrawAmount,
                status: 0,// 0 待审核，1 审核中，2 付款中，3 已付款，4 已撤销
                openid: wxContext.OPENID,
                publishedAt: new Date(),
                updatedAt: new Date()
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw("add error")
            }
        })
        // 更新余额 TODO 需要保证事务
        await db.collection('merchants').doc(event.phone).update({
            data: {
                balance: merchant.data.balance - event.withdrawAmount,
                updatedAt: new Date()
            },
            success: res => {
                console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [更新记录] 失败：', err)
                throw("update error")
            }
        })

    }catch(e) {
        throw(e)
    }

    return {}
}