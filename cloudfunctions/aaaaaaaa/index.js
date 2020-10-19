// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const _ = db.command

    const orders = await db.collection('iorders').where({storeId: 'e373396c5f85580f016ad0ab5d4c586c',status: 1,timestamp: _.gte(1603002947000).and(_.lte(1603030809000))}).get()

    let sum = 0

    for (var i = 0; i< orders.data.length;i++) {
        sum += parseFloat(orders.data[i].totalAmount)
        sum += parseFloat(orders.data[i].subsidy)
        sum -= parseFloat(orders.data[i].income7)
    }

    return sum

    // let tp = event.tp
    // if (tp == 'list') {
    //     let count = await db.collection('mstores').count()
    //     let currentPage = event.currentPage
    //     let pageSize = 50
    //     let totalCount = count.total
    
    //     const results = await db.collection('mstores').skip((currentPage-1)*pageSize).limit(pageSize).orderBy('createdAt','desc').get()
    
    //     return {
    //         data: results.data,
    //         totalCount: totalCount,
    //         currentPage: currentPage,
    //         pageSize: pageSize,
    //     }
    // }

    // if (tp == 'update') {
    //     let thumbnail = event.thumbnail
    //     let id = event.storeId
    //     return await db.collection('mstores').doc(id).update({
    //         data: {
    //             thumbnail: thumbnail
    //         }
    //     })
    // }

    // if (tp == 'addmerchant') {
    //     return await db.collection('merchants').add({
    //         data: {
    //             balance: event.balance,
    //             bank: event.bank,
    //             createdAt: event.createdAt,
    //             updatedAt: event.updatedAt,
    //             bankcard: event.merchantBankCard,
    //             name: event.merchantName,
    //             phone: event.merchantPhone,
    //             openid: event.openid,
    //             password: event.password,
    //         }
    //     })
    // }

    return {}
    
}