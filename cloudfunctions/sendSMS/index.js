// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

const Core = require('@alicloud/pop-core');

// 云函数入口函数
exports.main = async (event, context) => {

    let code = Math.random().toString().substr(2,6)

    var params = {
        "RegionId": "cn-hangzhou",
        "PhoneNumberJson": "[\""+event.phone+"\"]",
        "SignNameJson": "[\"柒号生活\"]",
        "TemplateCode": "SMS_204116195",
        "TemplateParamJson": "[{\"code\":\""+code+"\"}]"
      }

    var client = new Core({
        accessKeyId: 'LTAI4GAwwVzvURzWCt48pX1C',
        accessKeySecret: '6dKalolTUSuxNkou0rm3PAeoKpWYUv',
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25'
    });

    var requestOption = {
        method: 'POST'
    };
      
    await client.request('SendBatchSms', params, requestOption).then((result) => {
        console.log(result)
    }, (ex) => {
        console.log(ex);
        throw(ex)
    })

    var result = await db.collection('codes').add({
        data: {
            phone: event.phone,
            code: code,
            time: Date.parse(new Date()),
        },
        success: res => {
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          console.error('[数据库] [新增记录] 失败：', err)
          throw(err)
        }
    })

    return result
}