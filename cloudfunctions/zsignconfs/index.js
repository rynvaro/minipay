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

        result.ruleTitle = signconf.ruleTitle
        result.rules = signconf.rules
        result.point = user.point
        result.signs = user.signs
        result.sevenSigns = user.sevenSigns

        // 用户未签到过
        if (user.signDate == 0){
            result.confs = signconf.onSaleConfs
            result.signed = false
            return result
        }

        let signDate = user.signDate

        let yesterdayStart = new Date()
        yesterdayStart.setHours(-32, 0, 0, 0)
        let yesterdayStartTime = yesterdayStart.getTime()
        console.log("yesterdayStartTime: ", yesterdayStartTime)

        let todayStart = new Date()
        todayStart.setHours(-8,0,0,0)
        let todayStartTime = todayStart.getTime()
        console.log("todayStartTime: ", todayStartTime)


        if (signDate < yesterdayStartTime) {
            // 昨日未签到
            result.confs = signconf.confs
            result.sevenSigns = 0
        }else { // 昨日签到过
            if (user.sevenSigns > 0 && user.signs < 7 && signconf.onSale) {
                result.confs = signconf.onSaleConfs
            }else {
                result.confs = signconf.confs
            }
        }

        
        

        if (user.signDate >= todayStartTime) {
            result.signed = true
            // 下一个循环
            if (user.sevenSigns > 7) {
                result.sevenSigns = 0
            }
        }else {
            result.signed = false
            // 下一个循环
            if (user.sevenSigns >= 7) {
                result.sevenSigns = 0
            }
        }

    }catch(e) {
        throw(e)
    }

    return result
}