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
        let history = event
        history.timestamp = Date.parse(new Date())
        history.type = 'submitwithdraw'
        db.collection('histories').add({data: history})
        const mstore = await db.collection("mstores").doc(event.storeID).get()
        if (mstore.data.balance < event.withdrawAmout) {
            throw("insufficient funds")
        }

        const trans = await db.startTransaction()
        await trans.collection('withdraws').add({
            data: {
                bank: mstore.data.bank,
                bankCard: mstore.data.merchantBankCard,
                storeName: mstore.data.storeName,
                merchantName: mstore.data.merchantName,
                storeID: event.storeID,
                withdrawAmount: event.withdrawAmount,
                status: 0,// 0 待审核，1 审核中，2 付款中，3 已付款，4 已撤销
                openid: wxContext.OPENID,
                publishedAt: Date.parse(new Date()),
                updatedAt: Date.parse(new Date()),
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(err)
            }
        })

        await trans.collection('mstores').doc(event.storeID).update({
            data: {
                balance: parseFloat((mstore.data.balance - event.withdrawAmount).toFixed(2)),
                updatedAt: Date.parse(new Date()),
            },
            success: res => {
                console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [更新记录] 失败：', err)
                throw(err)
            }
        })  

        await trans.commit()

        return {
            success: true
        }

    }catch(e) {
        console.log(e)
        return {
            success: false,
            error: e,
        }
    }
}