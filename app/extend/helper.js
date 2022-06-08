'use strict';

const crypto = require('crypto');
const _ = require('lodash');

module.exports = {
  md5(str) {
    const md5 = crypto.createHash('md5');
    return md5.update(str).digest('hex');
  },
  _, // 将lodash挂载到ctx上
};
