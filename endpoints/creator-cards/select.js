const { createHandler } = require('@app-core/server');
const selectCreatorCard = require('@app/services/creator-cards/select-creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',

  async handler(rc, helpers) {

    const payload = {
      ...rc.params,
      ...rc.query,
    };

    const response = await selectCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator Card Retrieved Successfully',
      data: response,
    };
  },
});