// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let result = {}

    try {
        const signConfs = await db.collection('signconfs').get()
        let signconf = signConfs.data[0]

        const userData = await db.collection('users').doc(wxContext.OPENID).get()
        let user = userData.data.data

        let date = new Date(userData.data.createdAt)
        date.setDate(date.getDate() + 3)
        let now = new Date()

        let isNew = false
        // 新用户
        if (formatDate(date) > (formatDate(now))){
            isNew = true
        }

        let signDate = new Date(user.signDate)
        signDate.setDate(signDate.getDate()+1)
        let terminated = false
        if (user.signDate != 0 && formatDate(signDate) < formatDate(now)) {
            terminated = true
        }
        
        console.log(isNew,terminated)

        if (isNew && signconf.onSale && !terminated) {
            result.confs = signconf.onSaleConfs
        }else {
            result.confs = signconf.confs
        }

        result.ruleTitle = signconf.ruleTitle
        result.rules = signconf.rules
        result.point = user.point
        result.signs = user.signs

        result.sevenSigns = user.sevenSigns
        // 昨日未签到
        if (user.signDate!=0 && formatDate(signDate) < formatDate(now)) {
            result.sevenSigns = 0
        }
        // 下一个循环
        let signDate1 = new Date(user.signDate)
        if (formatDate(signDate1) < formatDate(now) &&  user.sevenSigns == 7) {
            result.sevenSigns = 0
        }

        if (formatDate(new Date(user.signDate))==formatDate(now)) {
            result.signed = true
        }else {
            result.signed = false
        }

    }catch(e) {
        throw(e)
    }

    return result
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