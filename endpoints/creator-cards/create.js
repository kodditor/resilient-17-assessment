const { createHandler } = require('@app-core/server');
const createCreatorCard = require('@app/services/creator-cards/create');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',

  async handler(rc, helpers) {

    const payload = {
      ...rc.body,
    };

    const response = await createCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator card created successfully',
      data: response,
    };
  },
});