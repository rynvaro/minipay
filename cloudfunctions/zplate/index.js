// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let plateID = event.plateID

    var plate = {}

    try {
        plate = await db.collection('plates').doc(plateID).get()
    }catch (e) {
        throw(e)
    }

    return plate
}