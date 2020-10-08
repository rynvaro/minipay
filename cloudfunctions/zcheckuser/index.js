// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        const user = await db.collection('users').doc(wxContext.OPENID).get()
        if (!user.data.data.phone) {
            return -2 //未完善资料
        }
        const joinedusers = await db.collection('lottories').where({openid: wxContext.OPENID, eventId: event.eventId}).get()
        if (joinedusers.data.length > 0) {
            user.data.data.status = joinedusers.data[0].status
        }else {
            user.data.data.status = 0
        }
        // user.data.lottoryimage = 'cloud://dev-osmu3.6465-dev-osmu3-1302781643/images/test/lottory.png'
        user.data.lottoryimage = 'cloud://release-8tcge.7265-release-8tcge-1302781643/images/byhand/aaa.png'
        return user
    }catch(e) {
        console.log(e)
        return -1 // 用户不存在
    }
}