const { MockModelStubs } = require('@app/mock-models');
const { ulid } = require('@app-core/randomness');

function createCreatorCardStore() {
  const cardsBySlug = new Map();
  const activeStubs = [];

  function findCard(query = {}) {
    const { slug, creator_reference: creatorReference, deleted } = query;

    if (!slug) {
      return null;
    }

    const card = cardsBySlug.get(slug);

    if (!card) {
      return null;
    }

    if (creatorReference && card.creator_reference !== creatorReference) {
      return null;
    }

    if (deleted === null && card.deleted != null && card.deleted !== 0) {
      return null;
    }

    return { ...card };
  }

  function install() {
    activeStubs.push(
      MockModelStubs.CreatorCard.configureStubs({
        method: 'findOne',
        overrideFn: (queryData) => findCard(queryData.query),
      })
    );

    activeStubs.push(
      MockModelStubs.CreatorCard.configureStubs({
        method: 'create',
        overrideFn: (data, existingFn) => {
          const doc = existingFn(data);
          const saved = {
            ...doc,
            _id: doc._id && !String(doc._id).startsWith('sample-') ? doc._id : ulid(),
            created: doc.created || Date.now(),
            updated: doc.updated || Date.now(),
            deleted: null,
          };

          cardsBySlug.set(saved.slug, saved);
          return saved;
        },
      })
    );

    activeStubs.push(
      MockModelStubs.CreatorCard.configureStubs({
        method: 'deleteOne',
        overrideFn: (queryData) => {
          const id = queryData.query?._id;

          for (const card of cardsBySlug.values()) {
            if (card._id === id) {
              card.deleted = Date.now();
              return { deletedCount: 1 };
            }
          }

          return { deletedCount: 0 };
        },
      })
    );
  }

  function revertAll() {
    while (activeStubs.length) {
      activeStubs.pop().revert();
    }

    cardsBySlug.clear();
  }

  function seed(card) {
    cardsBySlug.set(card.slug, {
      deleted: null,
      ...card,
    });
  }

  function hasSlug(slug) {
    return cardsBySlug.has(slug);
  }

  return {
    install,
    revertAll,
    seed,
    hasSlug,
    cardsBySlug,
  };
}

module.exports = {
  createCreatorCardStore,
};
