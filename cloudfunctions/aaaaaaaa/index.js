// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let tp = event.tp
    if (tp == 'list') {
        let count = await db.collection('mstores').count()
        let currentPage = event.currentPage
        let pageSize = 50
        let totalCount = count.total
    
        const results = await db.collection('mstores').skip((currentPage-1)*pageSize).limit(pageSize).orderBy('createdAt','desc').get()
    
        return {
            data: results.data,
            totalCount: totalCount,
            currentPage: currentPage,
            pageSize: pageSize,
        }
    }

    if (tp == 'update') {
        let thumbnail = event.thumbnail
        let id = event.storeId
        return await db.collection('mstores').doc(id).update({
            data: {
                thumbnail: thumbnail
            }
        })
    }

    if (tp == 'addmerchant') {
        return await db.collection('merchants').add({
            data: {
                balance: event.balance,
                bank: event.bank,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
                bankcard: event.merchantBankCard,
                name: event.merchantName,
                phone: event.merchantPhone,
                openid: event.openid,
                password: event.password,
            }
        })
    }

    return {}
    
}