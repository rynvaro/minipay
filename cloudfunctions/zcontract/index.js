// 云函数入口文件
const cloud = require('wx-server-sdk')


cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    let type = event.type
    if (type == 'template') {
        const mstores = await db.collection('mstores').where({openid: wxContext.OPENID}).get()
        const contracts = await db.collection('contract').get()
        let content = contracts.data[0].title
        content = content.replace('${merchantName}', mstores.data[0].merchantName)
        content = content.replace('${discount}','____'+event.discount+'____')
        content = content.replace('${approveDate}',formatDate(new Date()))
        await db.collection('mstores').doc(mstores.data[0]._id).update({
            data: {
                discount: event.discount,
            }
        })
        return content
    }else if (type == 'self') {
        const icontracts = await db.collection('contracts').where({openid: wxContext.OPENID}).get()
        console.log(icontracts)
        return icontracts.data[0].contract
    }
}

function formatDate(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return year + ' 年' + month + ' 月' + day + ' 日' 
}