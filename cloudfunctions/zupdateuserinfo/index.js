// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let username = event.username
    let phone = event.phone
    let inviteBy = event.inviteBy

    try {
        await db.collection('users').doc(wxContext.OPENID).update({
            data: {
                data: {
                    phone: phone,
                    username: username,
                    inviteBy: inviteBy,
                    updateAt: Date.parse(new Date()),
                }
            },
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })
    }catch(e) {
        throw(e)
    }

    return {}

}