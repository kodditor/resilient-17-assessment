const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
// const PaymentMessages = require('@app/messages/payment'); // Your message file
const CreatorCard = require('@app/repository/creator-card');

const spec = `root {
  slug string
  access_code? string
}`;

const parsedSpec = validator.parse(spec);

async function selectCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedSpec);

  try {

    const creatorCard = await CreatorCard.findOne({ query: { slug: data.slug, deleted: null } });
    if(!creatorCard){
      // TODO: throw error
    }

    if(creatorCard.status === 'draft'){
      // TODO: throw error
    }

    if(creatorCard.access_type === 'private' && !data.access_code){
      // TODO: throw error
    }

    if(creatorCard.access_type === 'private' && data.access_code !== creatorCard.access_code){
      // TODO: throw error
    }

    response = {
      "id": creatorCard._id,
      "title": creatorCard.title,
      "description": creatorCard.description,
      "slug": creatorCard.slug,
      "creator_reference": creatorCard.creator_reference,
      "links": creatorCard.links,
      "service_rates": creatorCard.service_rates,
      "status": creatorCard.status,
      "access_type": creatorCard.access_type,
      "created": creatorCard.created,
      "updated": creatorCard.updated,
      "deleted": creatorCard.deleted
    };

  } catch (error) {
    appLogger.errorX(error, 'select-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = selectCreatorCard;