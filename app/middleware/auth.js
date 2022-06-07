'use strict';
module.exports = () => {
  return async (ctx, next) => {
    // 1.获取请求token
    let token = ctx.headers.authorization;
    token = token ? token.split('Token: ')[1] : null;
    // 2.验证token
    if (!token) {
      return ctx.throw(401);
    }
    // 3.获取用户信息
    try {
      const decodeToken = await ctx.service.user.verifyToken(token);
      const user = await ctx.model.User.findById(decodeToken.userId);
      ctx.user = user;
    } catch (error) {
      return ctx.throw(401);
    }
    // 4.执行next()
    await next();
  };
};
