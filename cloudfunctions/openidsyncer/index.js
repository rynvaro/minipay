// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    // TODO token updating
    let token = await db.collection('wxetokens').get()
    let next_openid = ''
    var res = await axios.get('https://api.weixin.qq.com/cgi-bin/user/get?access_token='+token.data[0].token+'&next_openid='+next_openid)
    for (var i = 0; i<res.data.openid.length; i++) {
        var data = {
            openid: res.data.openid[i],
            timestamp: Date.parse(new Date())
        }
        await db.collection('popenids').add({
            data: data
        })
    }
    return res.data
}