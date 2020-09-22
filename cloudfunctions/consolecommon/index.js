// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
   let tp = event.tp
   console.log(event)

   if (tp == "events") {
       return await db.collection("events").get()
   }

   if (tp == "eventadd") {
       delete event.tp
       return await db.collection('events').add({
           data: event
       })
   }

   if (tp == "eventdelete") {
       return await db.collection('events').doc(event._id).remove()
   }

   if (tp == "eventupdate") {
       let id = event._id
        delete event.tp
        delete event._id
        return await db.collection('events').doc(id).update({
            data: event
        })
    }

    if (tp == "storedelete") {
        return await db.collection('mstores').doc(event._id).update({
            data: {
                deleted: 1,
            }
        })
    }

    if (tp == "exchangebanners") {
        return await db.collection('plates').where({type: 'banner'}).get()
    }

    if (tp == "exchangebannerdelete") {
        return await db.collection('plates').doc(event.id).delete()
    }

    if (tp == "exchangebanneradd") {
        delete event.tp
        event.type = 'banner'
        return await db.collection('plates').add({
            data: event,
        })
    }

    if (tp == "switchplatestatus") {
        return await db.collection('plates').doc(event._id).update({
            data: {
                status: event.status
            }
        })
    }

   return {}
}