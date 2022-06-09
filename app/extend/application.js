// 框架会把 app/extend/application.js 中定义的对象与 Koa Application 的 prototype 对象进行合并，在应用启动时会基于扩展后的 prototype 生成 app 对象。
'use strict';

const RPCClient = require('@alicloud/pop-core').RPCClient;

function initVodClient(accessKeyId, accessKeySecret) {
  const regionId = 'cn-beijing'; // 点播服务接入地域
  const client = new RPCClient({// 填入AccessKey信息
    accessKeyId,
    accessKeySecret,
    endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
    apiVersion: '2017-03-21',
  });

  return client;
}

let vodClient = null;

module.exports = {
  get vodClient() {
    if (!vodClient) {
      const { accessKeyId, accessKeySecret } = this.config.vod;
      vodClient = initVodClient(accessKeyId, accessKeySecret);
    }
    return vodClient;
  },
};
