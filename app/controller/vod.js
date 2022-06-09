'use strict';

const Controller = require('egg').Controller;

class VodController extends Controller {
  async CreateUploadVideo() {
    const query = this.ctx.query;
    this.ctx.validate({
      Title: { type: 'string', required: true },
      FileName: { type: 'string', required: true },
    }, query);

    this.ctx.body = await this.app.vodClient.request('CreateUploadVideo', query, {});
  }
  async RefreshUploadVideo() {
    const query = this.ctx.query;
    this.ctx.validate({
      VideoId: { type: 'string', required: true },
    }, query);

    this.ctx.body = await this.app.vodClient.request('RefreshUploadVideo', query, {});
  }
}

module.exports = VodController;
