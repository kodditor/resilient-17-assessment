const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCardMessages = require('@app/messages/creator-card');
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
      throwAppError(CreatorCardMessages.SLUG_NOT_FOUND, ERROR_CODE.SLUG_NOT_FOUND);
    }

    if(creatorCard.status === 'draft'){
      throwAppError(CreatorCardMessages.CARD_IN_DRAFT_STATUS, ERROR_CODE.CARD_IN_DRAFT_STATUS);
    }

    if(creatorCard.access_type === 'private' && !data.access_code){
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, ERROR_CODE.ACCESS_CODE_REQUIRED);
    }

    if(creatorCard.access_type === 'private' && data.access_code !== creatorCard.access_code){
      throwAppError(CreatorCardMessages.ACCESS_CODE_INCORRECT, ERROR_CODE.ACCESS_CODE_INCORRECT);
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