// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const hisR = await db.collection('his_searchs').where({openid: wxContext.OPENID}).orderBy('t','desc').limit(6).get()
    const hotR = await db.collection('hot_searchs').orderBy('times','desc').limit(6).get()
    
    let his = []
    let hot = []

    for (var i = 0; i<hisR.data.length; i++) {
        his.push(hisR.data[i].q)
    }

    for (var i = 0; i<hotR.data.length; i++) {
        hot.push(hotR.data[i].q)
    }

    return {
        his: his,
        hot: hot,
    }
}