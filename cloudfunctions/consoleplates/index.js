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


    // 新增
    if (tp == 1) {
        delete event.tp
        const result = await db.collection('plates').add({
            data: {
                status: 0,
                image: event.image,
                title: event.title,
                index: event.index,
                items: [],
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
              },
              fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(err)
              }
            })
        result.image = event.image
        result.index = event.index
        result.title = event.title
        result.items =[]
        return result
    }

    // 更新
    if (tp == 2) {
    let id = event._id 
    return await db.collection('plates').doc(id).update({
        data: {
            linkTo: event.linkTo,
            title: event.title,
            index: event.index,
            image: event.image,
            items: event.items,
        },
        success: res => {
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          },
          fail: err => {
            console.error('[数据库] [新增记录] 失败：', err)
            throw(err)
          }
        })
    }

    // get
    if (tp == 3) {
        return await db.collection('plates').doc(event._id).get()
    }

    return await db.collection('plates').get()
}