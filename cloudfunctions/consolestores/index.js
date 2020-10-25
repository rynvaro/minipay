// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})


// 云函数入口函数
exports.main = async (event, context) => {
    console.log("event is: ", event)

    let tp = event.tp 
    let q = event.q


    if (tp == 1) {
        return await db.collection('mstores').doc(event.id).get()
    }
    
    let where = {}
    if (q) {
        q = q.trim()
        where = db.command.or(
            [
                {
                    storeName: {
                        $regex: '.*' + q,
                        $options: 'i'
                    }
                },
                {
                    storeDesc: {
                        $regex: '.*' + q,
                        $options: 'i'
                    }
                },
                {
                    merchantPhone: {
                        $regex: '.*' + q,
                        $options: 'i'
                    }
                }
            ]
        )
        return await db.collection('mstores').where(where).orderBy('updatedAt','desc').get()
    }

    let count = await db.collection('mstores').where(where).count()

    let currentPage = event.currentPage
    let pageSize = event.pageSize
    let totalCount = count.total

    const results = await db.collection('mstores').skip((currentPage-1)*pageSize).limit(pageSize).orderBy('updatedAt','desc').get()

    return {
        data: results.data,
        totalCount: totalCount,
        currentPage: currentPage,
        pageSize: pageSize,
    }
}