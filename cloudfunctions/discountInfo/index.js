// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let storeID = event.storeID

    const mstore = await db.collection('mstores').doc(storeID).get()
  
    return {
        discount: mstore.data.discount,
        startTime: formatDate(new Date(mstore.data.discountStart)),
        endTime: formatDate(new Date(mstore.data.discountEnd)),
    }
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