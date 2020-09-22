// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {

    console.log(new Date())

    // await db.collection('cashflows').add({
    //     data: new Date(),
    // })

    let date = new Date()
    date.setHours(16, 0, 0, 0)
    let todayTimestamp = date.getTime()


    let yestday = new Date()
    yestday.setHours(16, 0, 0, 0)
    yestday.setDate(yestday.getDate()-1)
    let yestdayTimestamp = yestday.getTime()

    console.log("today is: ",todayTimestamp)
    console.log("yestday is: ", yestdayTimestamp)

    const _ = db.command
    const $ = _.aggregate
    const result = await db.collection('iorders').aggregate().match({timestamp: _.gte(yestdayTimestamp).and(_.lt(todayTimestamp))}).group(
        {
            _id: yestdayTimestamp,
            value: $.sum('$finalAmount')
        }
    ).end()

    let dailycash = {
        _id: yestdayTimestamp,
        value: 0,
        type: 1, // 1 收入 2 支出
    }
    if (result.list.length > 0) {
        dailycash.value = result.list[0].value
    }

    await db.collection('cashflows').add({
        data: dailycash,
    })

    return {}
}