// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})
const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log(event)
    let openid = wxContext.OPENID
    if (event.openid) {
        openid = event.openid
    }
    const _ = db.command

    try {
        // 1. 根据规则获取到优惠券
        let amount = event.amount
        const rules = await db.collection('couponrules').where({threshold: _.lte(amount*100), type: 'consumption'}).orderBy('threshold','desc').limit(1).get()
        if (rules.data.length == 0) {
            // 无满足条件的发放规则，不发放优惠券
            console.log("无满足条件的发放规则，不发放优惠券")
            return {}
        }

        let rule = rules.data[0]
        // 2. 更新用户的个人优惠券列表
        const coupons = await db.collection('coupondic').where({code: rule.code}).get()
        if (coupons.data.length == 0) {
            // 未找到指定条件的优惠券，不发放
            console.log('未找到指定条件的优惠券，不发放')
            return {}
        }
        let tmpCoupon = coupons.data[0]

        let userCoupon = {
            openid: openid,
            status: 0,
            coupon: {
                point: tmpCoupon.point,
                value: tmpCoupon.value,
                type: tmpCoupon.type,
                man: tmpCoupon.man,
            },
            timestamp: new Date().getTime(),
            expireAt: new Date().getTime() + (24 * 3600 * tmpCoupon.vpday)*1000
        }

        await db.collection('icoupons').add({
            data: userCoupon,
        })


        // 3. 发送优惠券到账通知
        cloud.openapi.subscribeMessage.send({
            touser: openid,
            templateId:'w27-oYHMzSoCke2C0j6VYmV9j3q6HnuO4jylKKg7Gv4',
            page: 'pages/coupon/coupon',
            // miniprogramState: 'developer',
            data: {
                thing1:{
                    value:'7号生活',
                },
                time3: {
                    value: '2020年10月29日',
                },
                thing4:{
                    value: '获得'+tmpCoupon.value/100+'元优惠券'
                },
            },
        })


    }catch(e){
        console.error(e)
        return {}
    }

    return {}
}