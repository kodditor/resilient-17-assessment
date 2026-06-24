const createMockServer = require('@app-core/mock-server');

const CREATOR_CARD_ENDPOINTS = [
  'endpoints/creator-cards/create.js',
  'endpoints/creator-cards/select.js',
  'endpoints/creator-cards/delete.js',
];

let creatorCardsServer;

function getCreatorCardsServer() {
  if (!creatorCardsServer) {
    creatorCardsServer = createMockServer(CREATOR_CARD_ENDPOINTS);
  }

  return creatorCardsServer;
}

module.exports = {
  getCreatorCardsServer,
  getSelectCreatorCardServer: getCreatorCardsServer,
};
