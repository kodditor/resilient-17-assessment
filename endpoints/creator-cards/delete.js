const { createHandler } = require('@app-core/server');
const deleteCreatorCard = require('@app/services/creator-cards/delete-creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',

  async handler(rc, helpers) {

    const payload = {
      ...rc.params,
      ...rc.body,
    };

    const response = await deleteCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: "Creator Card Deleted Successfully.",
      data: response,
    };
  },
});