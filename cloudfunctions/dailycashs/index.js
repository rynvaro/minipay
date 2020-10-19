// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {

    console.log(new Date().getTime())

    let date = new Date()
    date.setHours(16, 0, 0, 0)
    date.setDate(date.getDate()-1)
    let todayTimestamp = date.getTime()


    let yestday = new Date()
    yestday.setHours(16, 0, 0, 0)
    yestday.setDate(yestday.getDate()-2)
    let yestdayTimestamp = yestday.getTime()

    console.log("today is: ",todayTimestamp)
    console.log("yestday is: ", yestdayTimestamp)

    const _ = db.command
    const $ = _.aggregate
    const result = await db.collection('iorders').aggregate().match({status: 1, timestamp: _.gte(yestdayTimestamp).and(_.lt(todayTimestamp))}).group(
        {
            _id: yestdayTimestamp,
            value: $.sum('$finalAmount'),
            couponValue: $.sum('$coupon'),
            realCouponValue: $.sum('realCoupon')
        }
    ).end()
    const resultOut = await db.collection('withdraws').aggregate().match({updatedAt: _.gte(yestdayTimestamp).and(_.lt(todayTimestamp)),status: 3}).group({
        _id: yestdayTimestamp,
        value: $.sum('$withdrawAmount')
    }).end()

    let dailycash = {
        _id: yestdayTimestamp,
        in: 0,
        out: 0,
        coupon: 0,
        realCouponValue: 0,
    }
    if (result.list.length > 0) {
        dailycash.in = result.list[0].value
        dailycash.coupon = result.list[0].couponValue
        dailycash.realCoupon = result.list[0].realCouponValue
    }
    if (resultOut.list.length > 0) {
        dailycash.out = resultOut.list[0].value
    }

    await db.collection('cashflows').add({
        data: dailycash,
    })
    
    return {}
}