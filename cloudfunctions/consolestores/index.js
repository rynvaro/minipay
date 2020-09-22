// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})


// 云函数入口函数
exports.main = async (event, context) => {

    let tp = event.tp 
    let q = event.q

    if (tp == 1) {
        return await db.collection('mstores').doc(event.id).get()
    }
    
    let where = {deleted: 0}
    if (q) {
        where = where.and(db.command.or(
            [
                {
                storeName: {
                    $regex: '.*' + event.q,
                    $options: 'i'
                }
                },
                {
                storeDesc: {
                    $regex: '.*' + event.q,
                    $options: 'i'
                }
                }
            ]
        ))
    }

    return await db.collection('mstores').where(where).orderBy('createdAt','desc').get()
}