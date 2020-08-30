// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        const user = await db.collection('users').doc(wxContext.OPENID).get()

        let today = formatDate(new Date())
        if (user.data.data.signDate==today) {
            return 2 // 今日已签到
        }
        var delta = 0

        if (user.data.data.signs==0) {
            delta = 100
        }else if (user.data.data.signs==1) {
            delta = 200
        } else if (user.data.data.signs==2) {
            delta = 300
        }else {
            if (user.data.data.exp>10000) {
                delta = 3
            }else {
                delta = 2
            }
        }

        await db.collection('users').doc(wxContext.OPENID).update({
            data: {
                data: {
                    signDate: today,
                    signs: user.data.data.signs + 1,
                    point: user.data.data.point + delta,
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

        // 积分变更记录
        await db.collection('pointrecords').add({
            data: {
                openid: wxContext.OPENID,
                type: 1, // 签到
                action: '+',
                value: delta,
                timestamp: Date.parse(new Date()),
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


    return 1
}

function formatDate(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return [year, month, day].map(formatNumber).join('.')
  }
  
  function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }