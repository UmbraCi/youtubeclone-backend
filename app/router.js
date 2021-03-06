'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  const auth = app.middleware.auth();

  router.prefix('/api/v1');

  router.post('/users', controller.user.create);
  router.post('/users/login', controller.user.login);
  router.get('/user', auth, controller.user.getCurrentUser);

  router.patch('/user', auth, controller.user.update);
  router.get('/users/:userId', app.middleware.auth({ required: false }), controller.user.getUser);

  // 用户订阅相关的接口
  router.post('/users/:userId/subscribe', auth, controller.user.subscribe);
  router.delete('/users/:userId/subscribe', auth, controller.user.unSubscribe);
  router.get('/users/:userId/subscriptions', controller.user.getSubscriptions);

  // 阿里云VOD
  router.get('/vod/CreateUploadVideo', auth, controller.vod.CreateUploadVideo);
  router.get('/vod/RefreshUploadVideo', auth, controller.vod.RefreshUploadVideo);
  router.post('/videos', auth, controller.video.createVideo); // 创建视频
  router.get('/videos/:videoId', app.middleware.auth({ required: false }), controller.video.getVideo); // 获取视频
  router.get('/videos/', controller.video.getVideos); // 获取视频
  router.get('/users/:userId/videos/', controller.video.getUserVideos); // 获取视频
};
