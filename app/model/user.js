'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
      required: true,
    },
    // 头像
    avatar: {
      type: String,
      default: null,
    },
    // 封面
    cover: {
      type: String,
      default: null,
    },
    // 频道介绍
    channelDescription: {
      type: String,
      default: null,
    },
    // 创建时间
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updateAt: {
      type: Date,
      default: Date.now,
    },
  });

  return mongoose.model('User', UserSchema);
};

