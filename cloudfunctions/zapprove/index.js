// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const mstores = await db.collection('mstores').where({openid: wxContext.OPENID}).get()

    let store = mstores.data[0]
    let contract = event.contract

    await db.collection('contracts').add({
        data: {
            openid: wxContext.OPENID,
            storeName: store.storeName,
            storeId: store._id,
            merchantName: store.merchantName,
            approveDate: Date.parse(new Date()),
            contract: contract,
        },
        success: res => {
            console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
            console.error('[数据库] [更新记录] 失败：', err)
            throw(err)
        }
    })

    await db.collection('mstores').doc(store._id).update({
        data: {
            approved: true
        },
        success: res => {
            console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
            console.error('[数据库] [更新记录] 失败：', err)
            throw(err)
        }
    })

    return {}
}