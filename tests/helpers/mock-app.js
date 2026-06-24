const createMockServer = require('@app-core/mock-server');

let server;

function getSelectCreatorCardServer() {
  if (!server) {
    server = createMockServer(['endpoints/creator-cards/select.js']);
  }

  return server;
}

module.exports = {
  getSelectCreatorCardServer,
};
