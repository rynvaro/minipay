// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        var msgR = await cloud.openapi.security.msgSecCheck({
            content: JSON.stringify(event)
        })
        console.log(msgR)
    }catch(e) {
        return e
    }

    let phone = event.phone
    let inviteBy = event.inviteBy
    let birthday = event.birthday
    

    try {

        const user = await db.collection('users').doc(wxContext.OPENID).get()
        if (user.data.inviteCode == inviteBy) {
            return -1 // 不能邀请自己
        }

        if (inviteBy!='') {
            const users = await db.collection('users').where({inviteCode: inviteBy}).get()
            if (users.data.length == 0) {
                return -2 // 兑换码不存在
            }
        }

        await db.collection('users').doc(wxContext.OPENID).update({
            data: {
                data: {
                    phone: phone,
                    inviteBy: inviteBy,
                    birthday: birthday,
                },
                redpack: {
                    status: 0, //可用
                },
                updateAt: Date.parse(new Date()),
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