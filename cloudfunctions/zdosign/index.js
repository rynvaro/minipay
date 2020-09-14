// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        const user = await db.collection('users').doc(wxContext.OPENID).get()

        const signConfs = await db.collection('signconfs').get()
        let signconf = signConfs.data[0]

        let signDate = new Date(user.data.data.signDate)
        let today = Date.parse(new Date())
        if (user.data.data.signDate != 0 && formatDate(new Date(signDate))==formatDate(new Date(today))) {
            return 2 // 今日已签到
        }

        let date = new Date(user.data.data.createdAt)
        date.setDate(date.getDate() + 7)
        let isNew = false
        // 新用户
        if (formatDate(date) > (formatDate(new Date(today)))){
            isNew = true
        }
        
        let terminated = false
        signDate.setDate(signDate.getDate()+1)
        if (user.data.data.signDate != 0 && formatDate(signDate) != formatDate(new Date(today))) {
            terminated = true
        }


        var sevenSigns = user.data.data.sevenSigns + 1
        var pointDelta = 0
        let confs = signconf.confs

        if (isNew && !terminated) {
            confs = signconf.onSaleConfs
        }
        if (terminated || sevenSigns > 7) {
            sevenSigns = 1
        }

        let index = sevenSigns - 1
        pointDelta = confs[index]


        await db.collection('users').doc(wxContext.OPENID).update({
            data: {
                data: {
                    signDate: today,
                    signs: user.data.data.signs + 1,
                    point: user.data.data.point + pointDelta,
                    sevenSigns: sevenSigns,
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
                value: pointDelta,
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