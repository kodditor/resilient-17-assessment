const { MockModelStubs } = require('@app/mock-models');

function buildCreatorCard(overrides = {}) {
  return {
    _id: '01JG8XYZA2B3C4D5E6F7G8H9J0',
    title: 'George Cooks',
    description: 'George Cooks is a weekly cooking podcast by Chef George AmadiObi',
    slug: 'george-cooks',
    creator_reference: 'crt_8f2k1m9x4p7w3q5z',
    links: [{ title: 'YouTube Channel', url: 'https://youtube.com/@georgecooks' }],
    service_rates: {
      currency: 'NGN',
      rates: [
        {
          name: 'IG Story Post',
          description: 'One Instagram story mention',
          amount: 5000000,
        },
      ],
    },
    status: 'published',
    access_type: 'public',
    access_code: null,
    created: 1767052800000,
    updated: 1767052800000,
    deleted: null,
    ...overrides,
  };
}

function stubCreatorCardFindOne(docConfig = {}, options = {}) {
  return MockModelStubs.CreatorCard.configureStubs({
    method: 'findOne',
    mockNull: Boolean(options.notFound),
    docConfig,
  });
}

module.exports = {
  buildCreatorCard,
  stubCreatorCardFindOne,
};
