const { expect } = require('chai');
const { getSelectCreatorCardServer } = require('../../helpers/mock-app');
const { buildCreatorCard, stubCreatorCardFindOne } = require('../../helpers/creator-card-stub');

describe('GET /creator-cards/:slug', () => {
  const server = getSelectCreatorCardServer();
  const endpoint = '/creator-cards/george-cooks';

  let activeStub;

  afterEach(() => {
    if (activeStub) {
      activeStub.revert();
      activeStub = null;
    }
  });

  it('returns 200 with card data for a published public card', async () => {
    activeStub = stubCreatorCardFindOne(buildCreatorCard());

    const { statusCode, data } = await server.get(endpoint);

    expect(statusCode).to.equal(200);
    expect(data.status).to.equal('success');
    expect(data.message).to.equal('Creator Card Retrieved Successfully.');
    expect(data.data.id).to.equal('01JG8XYZA2B3C4D5E6F7G8H9J0');
    expect(data.data.slug).to.equal('george-cooks');
    expect(data.data.status).to.equal('published');
    expect(data.data.access_type).to.equal('public');
    expect(data.data).to.not.have.property('access_code');
  });

  it('returns 404 NF01 when no card exists for the slug', async () => {
    activeStub = stubCreatorCardFindOne({}, { notFound: true });

    const { statusCode, data } = await server.get(endpoint);

    expect(statusCode).to.equal(404);
    expect(data.status).to.equal('error');
    expect(data.code).to.equal('NF01');
  });

  it('returns 404 NF02 when the card is a draft', async () => {
    activeStub = stubCreatorCardFindOne(buildCreatorCard({ status: 'draft' }));

    const { statusCode, data } = await server.get(endpoint);

    expect(statusCode).to.equal(404);
    expect(data.status).to.equal('error');
    expect(data.code).to.equal('NF02');
  });

  it('returns 403 AC03 when the card is private and no access_code is supplied', async () => {
    activeStub = stubCreatorCardFindOne(
      buildCreatorCard({ access_type: 'private', access_code: 'A1B2C3' })
    );

    const { statusCode, data } = await server.get(endpoint);

    expect(statusCode).to.equal(403);
    expect(data.status).to.equal('error');
    expect(data.code).to.equal('AC03');
  });

  it('returns 403 AC04 when the card is private and access_code is incorrect', async () => {
    activeStub = stubCreatorCardFindOne(
      buildCreatorCard({ access_type: 'private', access_code: 'A1B2C3' })
    );

    const { statusCode, data } = await server.get(endpoint, {
      query: { access_code: 'WRONG1' },
    });

    expect(statusCode).to.equal(403);
    expect(data.status).to.equal('error');
    expect(data.code).to.equal('AC04');
  });

  it('returns 200 for a private card when the correct access_code is supplied', async () => {
    activeStub = stubCreatorCardFindOne(
      buildCreatorCard({ access_type: 'private', access_code: 'A1B2C3' })
    );

    const { statusCode, data } = await server.get(endpoint, {
      query: { access_code: 'A1B2C3' },
    });

    expect(statusCode).to.equal(200);
    expect(data.status).to.equal('success');
    expect(data.data.access_type).to.equal('private');
    expect(data.data).to.not.have.property('access_code');
  });
});
