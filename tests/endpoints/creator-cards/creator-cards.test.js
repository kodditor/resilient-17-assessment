const { expect } = require('chai');
const { getCreatorCardsServer } = require('../../helpers/mock-app');
const { createCreatorCardStore } = require('../../helpers/creator-card-store');

describe('Creator Cards API', () => {
  const server = getCreatorCardsServer();
  const store = createCreatorCardStore();

  before(() => {
    store.install();
  });

  after(() => {
    store.revertAll();
  });

  describe('valid flows', () => {
    it('Test Case 1 - creates a full public card (POST /creator-cards)', async () => {
      const { statusCode, data } = await server.post('/creator-cards', {
        body: {
          title: 'George Cooks',
          description: 'Weekly cooking podcast',
          slug: 'george-cooks',
          creator_reference: 'crt_8f2k1m9x4p7w3q5z',
          links: [{ title: 'YouTube', url: 'https://youtube.com/@georgecooks' }],
          service_rates: {
            currency: 'NGN',
            rates: [
              {
                name: 'IG Story Post',
                description: 'One story mention',
                amount: 5000000,
              },
            ],
          },
          status: 'published',
        },
      });

      expect(statusCode).to.equal(200);
      expect(data.status).to.equal('success');
      expect(data.data).to.have.property('id').that.is.a('string');
      expect(data.data).to.not.have.property('_id');
      expect(data.data.slug).to.equal('george-cooks');
      expect(data.data.access_type).to.equal('public');
      expect(data.data.title).to.equal('George Cooks');
      expect(store.hasSlug('george-cooks')).to.equal(true);
    });

    it('Test Case 2 - auto-generates slug from title (POST /creator-cards)', async () => {
      const { statusCode, data } = await server.post('/creator-cards', {
        body: {
          title: 'Ada Designs Things',
          creator_reference: 'crt_a1b2c3d4e5f6g7h8',
          status: 'published',
        },
      });

      expect(statusCode).to.equal(200);
      expect(data.data.slug).to.equal('ada-designs-things');
      expect(store.hasSlug('ada-designs-things')).to.equal(true);
    });

    it('Test Case 3 - creates a private card with access_code (POST /creator-cards)', async () => {
      const { statusCode, data } = await server.post('/creator-cards', {
        body: {
          title: 'VIP Rate Card',
          creator_reference: 'crt_x9y8z7w6v5u4t3s2',
          status: 'published',
          access_type: 'private',
          access_code: 'A1B2C3',
        },
      });

      expect(statusCode).to.equal(200);
      expect(data.data.slug).to.equal('vip-rate-card');
      expect(data.data.access_type).to.equal('private');
      expect(data.data.access_code).to.equal('A1B2C3');
      expect(store.hasSlug('vip-rate-card')).to.equal(true);
    });

    it('Test Case 4 - retrieves a public published card (GET /creator-cards/:slug)', async () => {
      const { statusCode, data } = await server.get('/creator-cards/george-cooks');

      expect(statusCode).to.equal(200);
      expect(data.status).to.equal('success');
      expect(data.data.id).to.be.a('string');
      expect(data.data.slug).to.equal('george-cooks');
      expect(data.data.status).to.equal('published');
      expect(data.data.access_type).to.equal('public');
      expect(data.data).to.not.have.property('access_code');
    });

    it('Test Case 5 - retrieves a private card with the correct pin (GET /creator-cards/:slug)', async () => {
      const { statusCode, data } = await server.get('/creator-cards/vip-rate-card', {
        query: { access_code: 'A1B2C3' },
      });

      expect(statusCode).to.equal(200);
      expect(data.status).to.equal('success');
      expect(data.data.slug).to.equal('vip-rate-card');
      expect(data.data.access_type).to.equal('private');
      expect(data.data).to.not.have.property('access_code');
    });

    it('Test Case 6 - deletes a card (DELETE /creator-cards/:slug)', async () => {
      const { statusCode, data } = await server.delete('/creator-cards/ada-designs-things', {
        body: {
          creator_reference: 'crt_a1b2c3d4e5f6g7h8',
        },
      });

      expect(statusCode).to.equal(200);
      expect(data.status).to.equal('success');
      expect(data.message).to.equal('Creator Card Deleted Successfully.');
      expect(data.data.slug).to.equal('ada-designs-things');
      expect(data.data.creator_reference).to.equal('crt_a1b2c3d4e5f6g7h8');
      expect(data.data).to.have.property('id').that.is.a('string');
      expect(data.data).to.not.have.property('_id');
      expect(data.data.deleted).to.be.a('number');
    });
  });

  describe('invalid flows', () => {
    it('Test Case 7 - rejects duplicate slug with SL02 (POST /creator-cards)', async () => {
      const { statusCode, data } = await server.post('/creator-cards', {
        body: {
          title: 'Another George',
          slug: 'george-cooks',
          creator_reference: 'crt_m1n2b3v4c5x6z7l8',
          status: 'published',
        },
      });

      expect(statusCode).to.equal(400);
      expect(data.status).to.equal('error');
      expect(data.code).to.equal('SL02');
    });

    it('Test Case 8 - rejects private card without access_code with AC01 (POST /creator-cards)', async () => {
      const { statusCode, data } = await server.post('/creator-cards', {
        body: {
          title: 'Secret Card',
          creator_reference: 'crt_q1w2e3r4t5y6u7i8',
          status: 'published',
          access_type: 'private',
        },
      });

      expect(statusCode).to.equal(400);
      expect(data.status).to.equal('error');
      expect(data.code).to.equal('AC01');
    });

    it('Test Case 9 - rejects access_code on public card with AC05 (POST /creator-cards)', async () => {
      const { statusCode, data } = await server.post('/creator-cards', {
        body: {
          title: 'Public Card',
          creator_reference: 'crt_q1w2e3r4t5y6u7i8',
          status: 'published',
          access_type: 'public',
          access_code: 'A1B2C3',
        },
      });

      expect(statusCode).to.equal(400);
      expect(data.status).to.equal('error');
      expect(data.code).to.equal('AC05');
    });

    it('Test Case 10 - rejects invalid status via framework validation (POST /creator-cards)', async () => {
      const { statusCode, data } = await server.post('/creator-cards', {
        body: {
          title: 'Bad Status Card',
          creator_reference: 'crt_q1w2e3r4t5y6u7i8',
          status: 'archived',
        },
      });

      expect(statusCode).to.equal(400);
      expect(data.status).to.equal('error');
    });

    it('Test Case 11 - returns NF01 for a non-existent card (GET /creator-cards/:slug)', async () => {
      const { statusCode, data } = await server.get('/creator-cards/does-not-exist-123');

      expect(statusCode).to.equal(404);
      expect(data.status).to.equal('error');
      expect(data.code).to.equal('NF01');
    });

    it('Test Case 12 - returns NF02 for a draft card (GET /creator-cards/:slug)', async () => {
      store.seed({
        _id: '01JGDRAFT000000000000000000',
        title: 'My Draft Card',
        slug: 'my-draft-card',
        creator_reference: 'crt_draft00000000001',
        status: 'draft',
        access_type: 'public',
        links: [],
        created: 1767052800000,
        updated: 1767052800000,
        deleted: null,
      });

      const { statusCode, data } = await server.get('/creator-cards/my-draft-card');

      expect(statusCode).to.equal(404);
      expect(data.status).to.equal('error');
      expect(data.code).to.equal('NF02');
    });

    it('Test Case 13 - returns AC03 when private card has no pin (GET /creator-cards/:slug)', async () => {
      const { statusCode, data } = await server.get('/creator-cards/vip-rate-card');

      expect(statusCode).to.equal(403);
      expect(data.status).to.equal('error');
      expect(data.code).to.equal('AC03');
    });

    it('Test Case 14 - returns AC04 for an incorrect pin (GET /creator-cards/:slug)', async () => {
      const { statusCode, data } = await server.get('/creator-cards/vip-rate-card', {
        query: { access_code: 'WRONG1' },
      });

      expect(statusCode).to.equal(403);
      expect(data.status).to.equal('error');
      expect(data.code).to.equal('AC04');
    });

    it('Test Case 15 - returns NF01 when deleting a non-existent card (DELETE /creator-cards/:slug)', async () => {
      const { statusCode, data } = await server.delete('/creator-cards/does-not-exist-123', {
        body: {
          creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        },
      });

      expect(statusCode).to.equal(404);
      expect(data.status).to.equal('error');
      expect(data.code).to.equal('NF01');
    });

    it('Test Case 16 - returns NF01 when retrieving a deleted card (GET /creator-cards/:slug)', async () => {
      const { statusCode, data } = await server.get('/creator-cards/ada-designs-things');

      expect(statusCode).to.equal(404);
      expect(data.status).to.equal('error');
      expect(data.code).to.equal('NF01');
    });
  });
});
