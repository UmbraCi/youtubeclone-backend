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
}

module.exports = UserController;
