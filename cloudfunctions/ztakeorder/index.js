// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log("event is ", event)

    let orderId = event.orderId
    let storeID = event.storeID
    let payAmount = parseFloat(event.payAmount)
    let couponID = event.couponID
    let mustPayAmount = parseFloat(event.mustPayAmount)
    
    let payType = parseInt(event.payby)
    let wxPayment = parseFloat(event.wxPayment.toFixed(2))
    let balancePayment = parseFloat(event.balancePayment.toFixed(2))

    let location = event.location

    var result = {}

    try {
        let history = event
        history.timestamp = Date.parse(new Date())
        history.type = 'takeorder'
        db.collection('histories').add({data: history})
        const store = await db.collection('mstores').doc(storeID).get()
        const user = await db.collection('users').doc(wxContext.OPENID).get()

        let level = user.data.data.level
        let delta = 0.0
        if ( level == 1 ) {
            delta = 0.5
        }else if (level == 2) {
            delta = 0.3
        }
        // 不参与平台抽成
        if(store.data.norake) {
            delta = 0
        }

        let realDiscount = store.data.discount
        if (store.data.discount <= 9 ) {
            realDiscount += delta
        }
        let percent = parseFloat(((10 - realDiscount) * 10).toFixed(2))
        let rebate = (payAmount*(1-(realDiscount/10))).toFixed(2)
        let income7 = (payAmount * delta/10).toFixed(2)
        let realAmount = (payAmount - parseFloat(rebate)).toFixed(2)
        let totalAmount = (parseFloat(realAmount) + mustPayAmount).toFixed(2)
        if (totalAmount < 0) {
            totalAmount = 0
        }

        
        /**
         * realAmount 打折后的价格
         * totalAmount 打折后的价格 + 不参与打折的（ 折扣是实际折扣，需要减去平台利润 才是商家收入 ）
         * income7 平台利润
         * 
         * finalAmount 用户最终支付的金额
         */

        
        let couponValue = 0
        if (couponID != -1) {
            const coupon = await db.collection('icoupons').doc(couponID).get()
            couponValue = coupon.data.coupon.value/100
        }
        let realCoupon = couponValue
        if (payAmount < realCoupon) {
            realCoupon = payAmount
        }

        var fanxian = parseFloat((percent/100 * (payAmount - realCoupon)).toFixed(2))
        console.log("---x--x-----", percent, fanxian ,payAmount, realCoupon)
        if (!store.data.maxFanxian) {
            store.data.maxFanxian = 0
        }
        var maxFanxian = parseFloat(store.data.maxFanxian.toFixed(2))
        var calcFanxian = fanxian
        if (maxFanxian > 0 && fanxian > maxFanxian) {
            fanxian = maxFanxian
        }

        let finnalAmount = (parseFloat(realAmount) + mustPayAmount - realCoupon).toFixed(2)

        var data = {
            _id: orderId,
            storeId: storeID,
            couponId: couponID,
            openid: wxContext.OPENID,
            userName: user.data.data.name,
            storeName: store.data.storeName,
            productImage: store.data.storeImages[0],
            payAmount: parseFloat(payAmount),
            discount: parseFloat(store.data.discount),
            realDiscount: parseFloat(realDiscount),
            rebate: parseFloat(rebate),
            realAmount: parseFloat(realAmount),
            coupon: couponValue,
            totalAmount: parseFloat(totalAmount),
            mustPayAmount: parseFloat(mustPayAmount),
            finalAmount: parseFloat(finnalAmount),
            income7: parseFloat(income7),
            realCoupon: parseFloat(realCoupon),
            timestamp: Date.parse(new Date()),
            status: -1, // 待支付
            norake: store.data.norake,
            percent: percent,
            payType: payType,
            wxPayment: wxPayment,
            balancePayment: balancePayment,
            fanxian: fanxian,
            calcFanxian: calcFanxian,
            location: location,
            progress: 0,
        }
        if (store.data.thumbnail) {
            data.thumbnail = store.data.thumbnail
        }

        result = await db.collection('iorders').add({
            data: data,
            success: res => {
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                console.error('[数据库] [新增记录] 失败：', err)
                throw(e)
            }
        })

        return result
    }catch(e) {
        throw(e)
    }
}
