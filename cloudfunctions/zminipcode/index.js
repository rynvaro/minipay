// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    var fileId = 'cloud://release-8tcge.7265-release-8tcge-1302781643/images/byhand/bbb.png'

    const res = await cloud.downloadFile({
        fileID: fileId,
    })

    return {
        buffer: res.fileContent
    }
    return await cloud.openapi.wxacode.getUnlimited({
        page: 'pages/index/index',
        scene: wxContext.OPENID,
        width: 10,
    })
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }