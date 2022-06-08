'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async create() {
    const { ctx } = this;
    const body = ctx.request.body;
    // 1.数据校验
    ctx.validate({
      username: { type: 'string' },
      email: { type: 'email' },
      password: { type: 'string' },
    }, body);

    const userService = this.service.user;

    if (await userService.findByUsername(body.username)) {
      this.ctx.throw(422, '用户已存在');
    }
    if (await userService.findByEmail(body.email)) {
      this.ctx.throw(422, '邮箱已存在');
    }

    // 2.保存用户
    const user = await userService.createUser(body);
    // 3.生成token
    const token = userService.createToken({
      userId: user._id,
    });

    // 4.发送响应
    ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        token,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }

  async login() {
    // 1.获取用户登录信息
    const { ctx } = this;
    const body = ctx.request.body;
    // 2.校验用户登录信息
    // 1.数据校验
    ctx.validate({
      email: { type: 'email' },
      password: { type: 'string' },
    });
    const userService = this.service.user;
    const user = await userService.findByEmail(body.email);
    if (!user) {
      this.ctx.throw(422, '用户不存在');
    }
    // 校验密码
    if (user.password !== this.ctx.helper.md5(body.password)) {
      this.ctx.throw(422, '密码错误');
    }
    // 3.生成token
    const token = userService.createToken({
      userId: user._id,
    });
    // 4.发送响应
    ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        token,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }

  async getCurrentUser() {
    const { ctx } = this;
    // 1.验证token
    // 2.获取用户信息
    // 3.发送响应
    const user = this.ctx.user;
    ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        token: this.ctx.headers.authorization,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    };
  }

  async update() {
    // 1.数据验证
    const { ctx } = this;
    const body = ctx.request.body;
    // 1.数据校验
    // try {
    ctx.validate({
      password: { type: 'string', required: false },
      channelDescription: { type: 'string', required: false },
      avatar: { type: 'string', required: false },
      username: { type: 'string', required: false },
      email: { type: 'email', required: false },
    }, body);
    // } catch (error) {
    //   return this.ctx.throw(422, error);
    // }
    const userService = this.service.user;
    if (body.email) {
      if (body.email !== ctx.request.body.email && await userService.findByEmail(body.email)) {
        this.ctx.throw(422, '邮箱已存在');
      }
    }
    if (body.username) {
      if (body.username && body.username !== ctx.request.body.username && await userService.findByUsername(body.username)) {
        this.ctx.throw(422, '用户名已存在');
      }
    }
    if (body.password) {
      body.password = this.ctx.helper.md5(body.password);
    }

    // 2.更新用户信息
    const updatedUser = await userService.updateUser(body);
    ctx.body = {
      user: {
        email: updatedUser.email,
        username: updatedUser.username,
        channelDescription: updatedUser.channelDescription,
        avatar: updatedUser.avatar,
      },
    };
  }

  async subscribe() {
    const user = this.ctx.user;
    const userId = user._id;
    const channelId = this.ctx.params.userId; // 要订阅的用户id
    // 1.用户不能订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throw(422, '不能订阅自己');
    }

    // 2.添加订阅
    const subscribedUser = await this.service.user.subscribe(userId, channelId);
    // 3.发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(subscribedUser, [ 'username', 'email', 'avatar', 'channelDescription', 'cover', 'subscribersCount' ]),
        isSubscribed: true,
      },
    };
  }

  async unSubscribe() {
    const user = this.ctx.user;
    const userId = user._id;
    const channelId = this.ctx.params.userId; // 要订阅的用户id
    // 1.用户不能订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throw(422, '不能取消订阅自己');
    }

    // 2.添加订阅
    const subscribedUser = await this.service.user.unSubscribe(userId, channelId);
    // 3.发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(subscribedUser, [ 'username', 'email', 'avatar', 'channelDescription', 'cover', 'subscribersCount' ]),
        isSubscribed: false,
      },
    };
  }

  async getUser() {
    // 1.获取订阅状态
    let isSubscribed = false;
    if (this.ctx.user) {
      // 获取订阅记录
      const record = await this.app.model.Subscription.findOne({
        user: this.ctx.user._id,
        channel: this.ctx.params.userId,
      });
      if (record) {
        isSubscribed = true;
      }
    }
    // 2.获取用户信息
    const user = await this.app.model.User.findById(this.ctx.params.userId);
    // 3.发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [ 'username', 'email', 'avatar', 'channelDescription', 'cover', 'subscribersCount' ]),
        isSubscribed,
      },
    };
  }

  async getSubscriptions() {
    const Subscription = this.app.model.Subscription;
    let subscriptions = await Subscription.find({
      user: this.ctx.params.userId,
    }).populate('channel');
    subscriptions = subscriptions.map(item => {
      return this.ctx.helper._.pick(item.channel, [ '_id', 'avatar', 'username' ]);
    });
    this.ctx.body = {
      subscriptions,
    };
  }

}

module.exports = UserController;
