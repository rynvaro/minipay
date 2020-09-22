// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})


// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log(event)

    try {
        const deposit = await db.collection('deposits').doc(event.depositID).get()
        const user = await db.collection('users').doc(wxContext.OPENID).get()

        console.log(deposit)
        console.log(user)
        console.log("--------")

        await db.collection('users').doc(wxContext.OPENID).update({
            data: {
                data: {
                    balance: user.data.data.balance + deposit.data.depositAmount,
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

        await db.collection('deposits').doc(event.depositID).update({
            data: {
                status: 1
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
        console.log(e)
        throw(e)
    }

    return {}
}