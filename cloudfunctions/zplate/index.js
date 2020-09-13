// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const _ = db.command

    let plateID = event.plateID

    var plate = {}


    try {
        const userData = await db.collection('users').doc(wxContext.OPENID).get()
        let user = userData.data.data
        
        plate = await db.collection('plates').doc(plateID).get()

        let ids = []
        for (var j = 0; j < plate.data.items.length; j++ ) {
            ids.push(plate.data.items[j].storeId)
        }
        let res = await db.collection('mstores').where({_id: _.in(ids)}).get()

        for (var x = 0; x<res.data.length; x++) {

            var realDiscount = res.data[x].discount
            if (realDiscount <= 9) {
                let delta = 0.0
                if ( user.level == 1 ) {
                    delta = 0.5
                }else if (user.level == 2) {
                    delta = 0.3
                }
                realDiscount = realDiscount + delta
            }

            plate.data.items[x].discount = realDiscount
        }
    }catch (e) {
        throw(e)
    }

    return plate
}