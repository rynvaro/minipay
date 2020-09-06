// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let level = 1;
    let viprights = []
    try {  
        const user = await db.collection('users').doc(wxContext.OPENID).get()
        let exp = user.data.data.exp
        if (exp < 1000) {
            level = 1
        }else if (exp > 1000 && exp < 10000) {
            level = 2
        }else if (exp >= 10000) {
            level = 3
        }

        const viprightObj = await db.collection('viprights').get()
        viprights = viprightObj.data

    }catch(e) {
        throw(e)
    }

    return {
        level: level,
        viprights: viprights,
    }
}